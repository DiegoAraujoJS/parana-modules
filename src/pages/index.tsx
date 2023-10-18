import Head from "next/head";
import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type Line = [number, number, number, number]
type MouseDownState = 1 | 2 | 3

const rows = [2,3,4,5,6,7]
const columns = [2,3,4,5,6,7]

const generateLinesForBox = (row: number, col: number): Line[] => {
  return [
    // [(a, b), (c, d)]
    [col - 1, row - 1, col - 1, row],
    [col - 1, row - 1, col, row - 1],
    [col - 1, row, col, row],
    [col, row - 1, col, row]
  ]
}

const lineIsVertical = (line: Line) => line[0] === line[2]

const isIdentical = (line1: Line, line2: Line) => (line1[0] === line2[0] && line1[1] === line2[1] && line1[2] === line2[2] && line1[3] === line2[3]) || (line1[2] === line2[0] && line1[3] === line2[1] && line1[0] === line2[2] && line1[1] === line2[3])

const renderLine = (line: Line): JSX.Element => {
  const [a, b, c, d] = line
  if (lineIsVertical(line)) {
    return <div onMouseEnter={console.log} className="bg-primary hover:bg-secondary" key={`${a}_${b}_${c}_${d}`} style={{
      gridColumnStart: a + 1,
      gridRowStart: Math.max(b, d),
      width: "8px",
    }}></div>
  } else {
    return <div className="bg-primary hover:bg-secondary" key={`${a}_${b}_${c}_${d}`} style={{
      gridColumnStart: Math.max(a, c),
      gridRowStart: b + 1,
      height: "8px",
    }}></div>
  }
}

const generateInstructions = (mouseDownState: MouseDownState) => {
  if (mouseDownState < 3) return "1. Presioná y pasá el cursor por las cajas"
  if (mouseDownState === 3) return "2. Tocá las columnas para generar espacios"
  return ""
}

export default function Home() {
  const [selected, setSelected] = useState<Line[]>([])

  const [isMouseDown, setIsMouseDown] = useState<MouseDownState>(1);

  const handleMouseDown = (row: number, col: number) => {
    const lines = generateLinesForBox(row, col)
    // const linesAreSelected = lines.every(line => selected.some(l => isIdentical(l, line)))
    // if (linesAreSelected) {
    // const newLines = deleteLines(selected, lines) // Remains an open question: How to define the lines to delete?
    // It will have to do with the requirements of valid modules: the set S of lines to delete will be such that the selected lines - S is a valid module.
    // For now, we will disable delete mode: you can only delete individual lines.
    // setSelected(newLines);
    // setIsMouseDown(true);
    // } else {
    const newLines = lines.filter(line => !selected.some(existingLine => isIdentical(line, existingLine)))
    setSelected([...selected, ...newLines])
    setIsMouseDown(2);
    // }
  };

  const resetSelected = () => {
    setSelected([])
    setIsMouseDown(1)
  }

  const handleMouseEnter = (row: number, col: number) => {
    console.log("mouse enter", isMouseDown)
    if (isMouseDown === 2) {
      const lines = generateLinesForBox(row, col)
      const newLines = lines.filter(line => !selected.some(existingLine => isIdentical(line, existingLine)))
      setSelected([...selected, ...newLines])
    }
  };

  const canvasBoxes = useMemo(() => rows.flatMap((row) => columns.map((col) => <div className={`${isMouseDown === 3 ? "pointer-events-none" : ""}`} key={`${row}_${col}`}
    style={{
      gridRowStart: row,
      gridColumnStart: col,
      border: "0.5px dashed black"
    }} 
    onMouseDown={() => handleMouseDown(row, col)}
    onMouseEnter={() => handleMouseEnter(row, col)}
  ></div>)), [selected, isMouseDown])

  useEffect(() => {
    const handleMouseUp = () => {
      console.log("mouse up")
      if (isMouseDown === 2) setIsMouseDown(3)
    }

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMouseDown])

  useEffect(() => {
    Swal.fire("", "<div style=\"font-size: 20px;\">Seguí las pasos indicados arriba para usar el maquetador. <br/> <br/>Si querés volver a empezar el proceso, tocá en cualquier momento el botón de <b>Reset</b>.</div>", "info")
  }, [])

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main id="modules" className="min-h-screen">

        <div className={`min-h-screen modules-canvas`}>
          <div className="row-start-1 col-start-8 flex items-center justify-center">
            <button className="btn btn-primary" onClick={resetSelected}>Reset</button>
          </div>
          <div className="row-start-1 col-start-2 col-end-6 flex items-center text-2xl">
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{generateInstructions(isMouseDown)}</span>
            </div>
          </div>
          {selected.map(renderLine)}
          {canvasBoxes}

        </div>
      </main>
    </>
  );
}
