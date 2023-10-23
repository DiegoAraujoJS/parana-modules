import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import type {Box, Line, MouseDownState } from "~/utils/modulesLogic"
import { TupleSet, deleteLine, generateInstructions, generateLinesForBoxDifference, getBoxPositionForLine, lineIsVertical } from "~/utils/modulesLogic";

const rows = [2,3,4,5,6,7]
const columns = [2,3,4,5,6,7]
const canvasBoxesSet = new TupleSet()
rows.flatMap(row => columns.map(col => [col, row] as Box['position'])).forEach(box => canvasBoxesSet.add(box, []))

export default function Home() {
  const [selected, setSelected] = useState<Line[]>([])
  const history = useRef<Line[]>([])
  const [doors, setDoors] = useState<Record<string, boolean>>({})
  const [isMouseDown, setIsMouseDown] = useState<MouseDownState>(1);

  const resetSelected = useCallback(() => {
    setSelected([])
    setDoors({})
    setIsMouseDown(1)
    history.current = []
  }, [setSelected, setDoors, setIsMouseDown])

  const handleDoors = useCallback((row: number, col: number, boxIsOutOfCanvas: boolean) => {
    if (boxIsOutOfCanvas) return
    if (isMouseDown === 3) return setDoors({...doors, [`${col}_${row}`]: !doors[`${col}_${row}`]})
  }, [isMouseDown, setDoors, doors])

  const handleMouseEnter = useCallback((row: number, col: number, boxIsOutOfCanvas: boolean) => {
    if (boxIsOutOfCanvas) return
    if (isMouseDown === 2) {
      const linesForBoxDifference = generateLinesForBoxDifference(row, col, selected)
      if (!linesForBoxDifference.length) return
      setSelected([...selected, ...linesForBoxDifference])
    }
  }, [isMouseDown, selected]);

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isMouseDown !== 1) return
    setSelected([...selected, ...generateLinesForBoxDifference(row, col, selected)])
    setIsMouseDown(2);
  }, [setSelected, setIsMouseDown, selected, isMouseDown])

  const renderLine = useCallback((line: Line): JSX.Element => {
    const style: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0
    }

    if (lineIsVertical(line)) {
      style.bottom = 0
      style.width = "10px"
    } else {
      style.right = 0
      style.height = "10px"
    }

    return <div onClick={(e) => {
      e.stopPropagation()
      history.current.push(line)
      return setSelected(deleteLine(selected, line))
    }} className={`bg-primary hover:bg-secondary ${isMouseDown === 2 ? "pointer-events-none" : ""}`} key={line.join('_')} style={style}></div>
  }, [isMouseDown, setSelected, selected])

  const renderBox = useCallback((box: Box) => {
    const boxIsOutOfCanvas = box.position[0] < columns[0]! || box.position[0] > columns[columns.length - 1]! || box.position[1] < rows[0]! || box.position[1] > rows[rows.length - 1]!
    const showLeftBorder = !boxIsOutOfCanvas && (box.lines.length === 0 || !box.lines.some(lineIsVertical))
    const showTopBorder = !boxIsOutOfCanvas && (box.lines.length === 0 || box.lines.every(lineIsVertical))
    const borderClassName = isMouseDown !== 3 ? `${showLeftBorder ? "border-l" : ""} ${showTopBorder ? "border-t" : ""} border-dashed border-primary` : ""
    return <div className={`${doors[`${box.position[0]}_${box.position[1]}`] ? "bg-accent" : ""} relative ${borderClassName}`} key={box.position.join('_')}
      style={{
        gridColumnStart: box.position[0],
        gridRowStart: box.position[1],
      }} 
      onMouseDown={() => handleMouseDown(box.position[1], box.position[0])}
      onMouseEnter={() => handleMouseEnter(box.position[1], box.position[0], boxIsOutOfCanvas)}
      onClick={() => handleDoors(box.position[1], box.position[0], boxIsOutOfCanvas)}
    >
      {box.lines.map(renderLine)}
    </div>
  }, [renderLine, handleMouseDown, handleMouseEnter, handleDoors, doors])

  const canvasBoxes = useMemo(() => {
    const selectedBoxes = new TupleSet()
    selected.forEach((line) => selectedBoxes.add(getBoxPositionForLine(line), [line]))

    return [
      ...selectedBoxes.toArray().map(renderBox),
      ...canvasBoxesSet.difference(selectedBoxes).toArray().map(renderBox)
    ]

  }, [selected, renderBox])

  useEffect(() => {
    const handleMouseUp = () => {
      if (isMouseDown === 2) return setTimeout(() => setIsMouseDown(3), 1)
    }
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMouseDown])

  useEffect(() => {
    void Swal.fire("", "<div style=\"font-size: 20px;\">Seguí las pasos indicados arriba para usar el maquetador. <br/> <br/>Si querés volver a empezar el proceso, tocá en cualquier momento el botón de <b>Reset</b>.</div>", "info")
  }, [])

  return (
    <>
      <Head>
        <title>Parana Modulos</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main id="modules" className="min-h-screen">

        <div className={`min-h-screen modules-canvas`}>
          <div className="row-start-1 col-start-8 flex items-center justify-center">
            <button className="btn btn-primary" onClick={resetSelected}>Reset</button>
          </div>
          {history.current.length ? <div className="row-start-1 col-start-1 flex items-center justify-center">
            <button className="btn btn-secondary" onClick={() => setSelected([...selected, history.current.pop()!])}>Atrás</button>
          </div> : null}
          <div className="row-start-1 col-start-2 col-end-6 flex items-center text-lg font-bold">
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                {generateInstructions(isMouseDown).map((instruction, i) => <p key={i}>{instruction}</p>)}
              </div>
            </div>
          </div>

          {canvasBoxes}

        </div>
      </main>
    </>
  );
}
