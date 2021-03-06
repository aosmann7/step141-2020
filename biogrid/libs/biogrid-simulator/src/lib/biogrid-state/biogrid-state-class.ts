/**
 * @summary defines the graph which connects all the items of the grid
 * @author Lev Stambler <levst@google.com>
 * @author Roland Naijuka <rnaijuka@google.com>
 *
 * Created at     : 6/29/2020, 8:56:21 AM
 * Last modified  : 7/29/2020, 9:26:02 AM
 */
import * as graphlib from 'graphlib';
import {
  StateGraphVertex,
  StateGraph,
  StateGraphEdge,
  Distance,
  ItemPosition,
  GridItem,
  Power,
  TownSize,
} from '@biogrid/grid-simulator';
import { GRID_ITEM_NAMES, ShortestDistances, RESISTANCE } from '../config';
import { MAIN_GRID } from './main-grid-item';

interface EdgeLabel {
  distance: number;
  power?: Power;
}

export class BiogridState implements StateGraph {
  private graph: graphlib.Graph;

  // TODO think about implement it StateGraphVertex[] as an object of key: name -> value: StateGraphVertex
  constructor(vertices: StateGraphVertex[], private townSize: TownSize) {
    // Directed so as to have two edges between A and B, but in opposite directions
    this.graph = new graphlib.Graph({ directed: true });

    // Initialize the graph with a grid which is a gridItem and has position (0, 0) to keep track of where the items are placed on the map
    const grid: GridItem = new MAIN_GRID(townSize);
    this.graph.setNode(grid.gridItemName, (grid as GridItem));

    // Add all the vertices as nodes/vertices of the graph, with a name for
    // the particular grid item and label which is data for the particular vertex as the GridItem itself
    vertices.map((vertex) =>
      this.graph.setNode(vertex.gridItemName, vertex as GridItem)
    );

    // Add all the edges that can be formed into the graph, read the add method for how it is done
    vertices.map((vertex) => this.connectNewVertex(vertex));
  }

  /**
   * Method to return the graph for the states of the grid
   */
  public getGraph() {
    return this.graph;
  }

  /**
   * cloneStateGraph is used to clone the graph for use in the brain.
   */
  public cloneStateGraph(): graphlib.Graph {
    return graphlib.json.read(graphlib.json.write(this.graph));
  }

  /**
   * getJsonGraph returns the json details of the graph
   */
  public getJsonGraph() {
    return graphlib.json.write(this.graph);
  }

  /**
   * setnewStateGraph sets a new graph for the state of the grid after any changes
   * @param newGraph holds the new state graph for the grid
   */
  public setnewStateGraph(newGraph: graphlib.Graph) {
    this.graph = newGraph;
  }

  /**
   * Set power between the nodes via the edges of the state graph
   */
  public setPowerBetweenNodes(v: string, w: string, power: Power) {
    const labelFromV: EdgeLabel = this.graph.edge(v, GRID_ITEM_NAMES.GRID);
    const labelToW: EdgeLabel = this.graph.edge(GRID_ITEM_NAMES.GRID, w);
    this.graph.setEdge(v, GRID_ITEM_NAMES.GRID, {
      distance: labelFromV.distance,
      power,
    });
    this.graph.setEdge(GRID_ITEM_NAMES.GRID, w, {
      distance: labelToW.distance,
      power,
    });
  }

  /**
   * Set all edge power to 0
   */
  public resetPowerOnEdges() {
    const edges = this.graph.edges();
    edges.forEach((edge) => this.resetEdge(edge));
  }

  /**
   * Method finds all the vertices in the graph and returns tehir names
   * @returns the names of the vertices / gridItems in the grid
   */
  public getAllVertices(): string[] {
    return this.graph.nodes();
  }

  /**
   * Method searches the graph for a specific node by its name
   * @param gridItemName is the string that represents the GridItem you are searching for
   */
  public getGridItem(gridItemName: string): GridItem {
    return this.graph.node(gridItemName);
  }

  /**
   * getAllGridItems searches the graph vertices and retrives the gridItems which are stored on the vertices
   */
  public getAllGridItems(): GridItem[] {
    return this.getAllVertices().map((vertexName) =>
      this.getGridItem(vertexName)
    );
  }

  /**
   * Method returns the shortest distance from every edge to the all the other edges
   * @returns the shortest distance from any edge to the other edges
   */
  public getShortestDistances(): ShortestDistances {
    return graphlib.alg.dijkstraAll(
      this.graph,
      this.getWeightbyGraph(this.graph)
    );
  }

  private getWeightbyGraph(graph: graphlib.Graph) {
    return function (edge: graphlib.Edge): Distance {
      return graph.edge(edge).distance;
    };
  }

  /**
   * Reset an edge by changing its power to 0
   */
  private resetEdge(edge: graphlib.Edge): void {
    const labels = this.graph.edge(edge);
    this.graph.setEdge(edge.v, edge.w, {
      distance: labels.distance,
      power: 0,
    });
  }

  /**
   * When given a specific edge, return the weight or distance between the two vertices
   * @param edge is the Edge of the graph which you would like to get
   * @returns the weight or the distance between the vertices of @param edge
   */
  public getWeightEdge(edge: graphlib.Edge): Distance {
    return this.graph.edge(edge).distance;
  }

  /**
   * Get all GridItem positions in the graph
   */
  public getAllPositions(): ItemPosition[] {
    return (this.graph.nodes() as string[]).map((vertex) =>
      this.getGridItem(vertex).getRelativePosition()
    );
  }

  /**
   * Add Edge when there is supposed to be an edge
   * Add edges from the grid, to the every other part of the grid except solar panels
   * Add reverse edges from the batteries to the grid
   * Add edge from solar panels to the grid, not the reverse
   * | symbol means a connection either from top - down, or down - top
   *                                     FROM GRID----->building<----------------------------------->building<---FROM GRID
   *                                                     ^--|                                   |------^
   *                                                        |----------S.SMALL_BATTERY----------|
   *                                                                               ^-----|
   *                  L.LARGE_BATTERY<------------------------------------>GRID<---------|
   *                            FROM SOLAR PANEL TO GRID (from down)--------| |----FROM SOLAR PANEL TO GRID (from down)
   *                                                  SOLAR_PANEL---------->| |<--------------SOLAR_PANEL
   * @param newVertex is the new item of the Grid to add to @param this.graph as displayed above
   */
  private connectNewVertex(newVertex: GridItem) {
    const newVertexName = newVertex.gridItemName;
    for (const vertex of this.graph.nodes()) {
      const distance = this.calculateDistance(
        newVertex,
        this.graph.node(vertex) as StateGraphVertex
      );
      let edge: StateGraphEdge;
      // Solar panels to the grid only
      // Searching for includes GRID so that when scaling it is easy to add multiple grids
      if (
        newVertexName.includes(GRID_ITEM_NAMES.SOLAR_PANEL) &&
        vertex.includes(GRID_ITEM_NAMES.GRID)
      ) {
        edge = { v: newVertexName, w: vertex, weight: distance };
      } else if (
        newVertexName.includes(GRID_ITEM_NAMES.LARGE_BATTERY) &&
        vertex.includes(GRID_ITEM_NAMES.GRID)
      ) {
        edge = { v: newVertexName, w: vertex, weight: distance };
        // Add the opposite edge from grid to battery
        this.graph.setEdge(vertex, newVertexName, { distance });
      } else if (newVertexName.includes(GRID_ITEM_NAMES.SMALL_BATTERY)) {
        if (vertex.includes(GRID_ITEM_NAMES.GRID)) {
          edge = { v: newVertexName, w: vertex, weight: distance };
          // Add the opposite edge from grid to battery
          this.graph.setEdge(vertex, newVertexName, { distance });
        } else if (vertex.includes(GRID_ITEM_NAMES.ENERGY_USER)) {
          edge = { v: newVertexName, w: vertex, weight: distance };
        } else {
          // Continue since there is no edge to create
          continue;
        }
      }
      // On gridItem Energy User do not add edge (A, A)
      else if (
        newVertexName.includes(GRID_ITEM_NAMES.ENERGY_USER) &&
        vertex !== newVertexName
      ) {
        if (
          vertex.includes(GRID_ITEM_NAMES.GRID) ||
          vertex.includes(GRID_ITEM_NAMES.SMALL_BATTERY)
        ) {
          edge = { v: vertex, w: newVertexName, weight: distance };
        } else if (vertex.includes(GRID_ITEM_NAMES.ENERGY_USER)) {
          edge = { v: newVertexName, w: vertex, weight: distance };
          // Add the reverse edge from the new energy user/ building to the other building
          this.graph.setEdge(vertex, newVertexName, { distance });
        } else {
          // Continue since there is no edge to create
          continue;
        }
      } else {
        // Do not connect the parts of the grid which don't have to be connected
        continue;
      }
      this.graph.setEdge(edge.v, edge.w, { distance: edge.weight });
    }
  }

  /**
   * Calculate distance via Pythagorean's theorem
   */
  private calculateDistance(v1: StateGraphVertex, v2: StateGraphVertex) {
    return Math.sqrt(
      Math.pow(v1.getRelativePosition().x - v2.getRelativePosition().x, 2) +
        Math.pow(v1.getRelativePosition().y - v2.getRelativePosition().y, 2)
    );
  }
}
