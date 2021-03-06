/**
 * @summary Designs page where user sees results from the simulation.
 * @author Awad Osman <awado@google.com>
 * @author Lev Stambler <levst@google.com>
 *
 * Created at    : 2020-07-07 09:31:49
 * Last modified : 2020-07-21 16:34:17
 */

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import './simulate-page.css';
import { Client } from '../../client';
import { BiogridSimulationResults } from '../../build';
import SimulationBoard, {
  GridItemRet,
  GridItemLines,
} from '../../components/simulation-board';
import PacmanLoader from 'react-spinners/PacmanLoader';

const SimBoardPlayable = (props: {
  simulationResults: BiogridSimulationResults;
  stateFrame: number;
}) => {
  const stateToGridItemRet = (state: any): GridItemRet[] => {
    return state.nodes.map((node: any) => {
      return {
        gridItemName: node.value.gridItemName,
        relativePosition: node.value.position ||
          node.value.relativePosition || { x: 0, y: 0 },
      };
    });
  };
  const stateToGridItemLines = (state: any): GridItemLines[] => {
    return state.edges.map((edge: any) => {
      return {
        fromItem: edge.v,
        toItem: edge.w,
        powerThroughLinesKiloWatts: edge.value.power,
      };
    });
  };
  return (
    <>
      <div>
        Time of day: {props.stateFrame % 12 === 0 ? 12 : props.stateFrame % 12}
        :00 {props.stateFrame >= 12 ? 'PM' : 'AM'}
      </div>
      <SimulationBoard
        grid_height_km={props.simulationResults.townSize.height}
        grid_width_km={props.simulationResults.townSize.width}
        // TODO add changing indices to show the progression of time for each subsequent state
        // Find the GitHub issue: https://github.com/googleinterns/step141-2020/issues/64
        items={stateToGridItemRet(
          props.simulationResults.states[
            props.stateFrame < props.simulationResults.states.length
              ? props.stateFrame
              : 0
          ]
        )}
        lines={stateToGridItemLines(
          props.simulationResults.states[
            props.stateFrame < props.simulationResults.states.length
              ? props.stateFrame
              : 0
          ]
        )}
      />
      ;
    </>
  );
};

export const SimulatePage = () => {
  const [stateFrame, setStateFrame] = useState(0);
  const [controlSimulation, setControlSimultation] = useState<{
    pauseFN: (reset: boolean) => void;
  }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationResults, setSimulationResults] = useState<
    BiogridSimulationResults
  >();
  const client = Client.getInstance();

  async function getSimulationResults() {
    const params = queryString.parse(window.location.hash.split('?')[1]);
    const body = {
      startDate: new Date(params.startDate as string),
      endDate: new Date(params.endDate as string),
      smallBatteryCells: parseInt(params.smallBatteryCells as string),
      largeBatteryCells: parseInt(params.largeBatteryCells as string),
      numBuildings: parseInt(params.numBuildings as string),
      numSolarPanels: parseInt(params.numSolarPanels as string),
      townHeight: parseInt(params.townHeight as string),
      townWidth: parseInt(params.townWidth as string),
    };
    const results = await client.api.simulateNewBiogrid({ body });
    setSimulationResults(results);
  }

  const history = useHistory();

  const redirectToHome = () => {
    history.push('/');
  };

  const pauseSimulation = async (reset = false) => {
    setIsPlaying(false);
    controlSimulation?.pauseFN(reset);
  };

  const stateToGridItemRet = (state: any): GridItemRet[] => {
    return state.nodes.map((node: any) => {
      return {
        gridItemName: node.value.gridItemName,
        relativePosition: node.value.position ||
          node.value.relativePosition || { x: 0, y: 0 },
      };
    });
  };
  const stateToGridItemLines = (state: any): GridItemLines[] => {
    return state.edges.map((edge: any) => {
      return {
        fromItem: edge.v,
        toItem: edge.w,
        powerThroughLinesKiloWatts: edge.value.power,
      };
    });
  };

  const play = (): ((reset: boolean) => void) | null => {
    if (isPlaying) {
      return null;
    }
    const simResultsStateLen = simulationResults?.states.length || 0;
    let finished = false;
    let reset = false;
    let pause = (shouldReset: boolean) => {
      reset = shouldReset;
      finished = true;
    };
    const runThroughSteps = async () => {
      setIsPlaying(true);
      for (let i = stateFrame; i < simResultsStateLen; i++) {
        if (finished) {
          if (reset) {
            setStateFrame(0);
          } else if (i > 1) {
            // This rewinds the simulation back one extra frame
            // So, when pause is pressed, the simulation pauses on the same frame
            setStateFrame(i - 2);
          }
          return;
        }
        await new Promise((res, rej) =>
          setTimeout(() => {
            setStateFrame(i);
            res();
          }, 1000)
        );
      }
      setIsPlaying(false);
    };
    runThroughSteps();
    return pause;
  };

  useEffect(() => {
    getSimulationResults();
  }, []);

  return (
    <div className="simulation">
      <button onClick={redirectToHome} className="redirect">
        Change your Inputs!
      </button>
      {simulationResults && (
        <div className="results">
          <div className="table-results-container">
            <div className="metrics-container">
              <h2>Metrics</h2>
              <table>
                <tr>
                  <td>Average Efficiency</td>
                  <td>{simulationResults.averageEfficiency}%</td>
                </tr>
              </table>
            </div>
            <div className="states-container">
              <h2>States Table</h2>
              {simulationResults.states.map((stateGraph) => (
                <table className="state-graph">
                  {((stateGraph as any).nodes as any[]).map((node: any) => (
                    <tr className="gridItem">
                      <td>{node.v}</td>
                      <table className="grid-item-values">
                        {Object.keys(node.value).map((key: string) => (
                          <>
                            <tr>
                              <td>{key}</td>
                              <td>{JSON.stringify(node.value[key])}</td>
                            </tr>
                          </>
                        ))}
                      </table>
                    </tr>
                  ))}
                </table>
              ))}
            </div>
          </div>

          <div className="simboard-container">
            <h2>Simulation Board</h2>
            <div className="simboard-controls">
              <button
                onClick={() => {
                  const playRet = play();
                  if (playRet instanceof Function) {
                    setControlSimultation({ pauseFN: playRet });
                  }
                }}
              >
                Play
              </button>
              <button onClick={() => pauseSimulation()}>Pause</button>
              <button
                onClick={() => {
                  pauseSimulation(true);
                  // State frame is also set to zero here to account for
                  // When the simulation is already paused
                  setStateFrame(0);
                }}
              >
                Reset
              </button>
            </div>

            <SimBoardPlayable
              simulationResults={simulationResults}
              stateFrame={stateFrame}
            />
          </div>
        </div>
      )}
      {!simulationResults && (
        <div className="loading-container">
          <PacmanLoader />
        </div>
      )}
    </div>
  );
};

export default SimulatePage;
