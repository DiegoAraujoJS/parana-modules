import Head from "next/head";
import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";

type Line = [number, number, number, number]

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

const renderLine = (line: Line): JSX.Element => {
  const [a, b, c, d] = line
  if (lineIsVertical(line)) {
    return <div key={`${a}_${b}_${c}_${d}`} style={{
      gridColumnStart: a + 1,
      gridRowStart: Math.max(b, d),
      width: "2px",
      background: "black"
    }}></div>
  } else {
    return <div key={`${a}_${b}_${c}_${d}`} style={{
      gridColumnStart: Math.max(a, c),
      gridRowStart: b + 1,
      height: "2px",
      background: "black"
    }}></div>
  }
}

export default function Home() {
  const [selected, setSelected] = useState<Line[]>([])

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  console.log("selected", selected)

  const handleMouseDown = (row: number, col: number) => {
    console.log("selected ->", selected)
    setSelected(generateLinesForBox(row, col))
    // setIsMouseDown(true);
  };

  const resetSelected = () => setSelected([])

  const handleMouseEnter = (row: number, col: number) => {
    console.log("mouse enter", row, col)
    if (isMouseDown) {
    }
  };

  const canvasBoxes = useMemo(() => rows.flatMap((row) => columns.map((col) => <div key={`${row}_${col}`}
    style={{
      gridRowStart: row,
      gridColumnStart: col,
      border: "0.5px dashed black"
    }} 
    onMouseDown={() => handleMouseDown(row, col)}
    // onMouseEnter={() => handleMouseEnter(row, col)}
  ></div>)), [])

  const lines = selected.map(renderLine)

  // useEffect(() => {
  //   const handleMouseUp = () => {
  //     setIsMouseDown(false)
  //   }

  //   window.addEventListener('mouseup', handleMouseUp)

  //   return () => {
  //     window.removeEventListener('mouseup', handleMouseUp)
  //   }
  // }, [])

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <div className={`min-h-screen modules-canvas`}>
          <div className="row-start-1 col-start-8 flex items-center justify-center">
            <button className="btn btn-primary" onClick={resetSelected}>Reset</button>
          </div>
          {canvasBoxes}
          {lines}
        </div>
      </main>
    </>
  );
}
