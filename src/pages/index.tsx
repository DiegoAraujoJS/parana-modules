import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type Line = [number, number, number, number]
type MouseDownState = 1 | 2 | 3

const rows = [2,3,4,5,6,7]
const columns = [2,3,4,5,6,7]

const generateLinesForBox = (row: number, col: number): Line[] => {
  return [
    // [(a, b), (c, d)]
    // lines [(a, b), (c, d)] are always described following the following rule: for vertical lines, we always have b + 1 = d. For horizontal lines, we always have a + 1 = c.
    // This restriction helps us to compute the function isBoxMate for two mate lines.
    [col - 1, row - 1, col - 1, row], // left
    [col - 1, row - 1, col, row - 1], // top
    [col - 1, row, col, row], // bottom
    [col, row - 1, col, row] // right
  ]
}

const isIdentical = (line1: Line, line2: Line) => (line1[0] === line2[0] && line1[1] === line2[1] && line1[2] === line2[2] && line1[3] === line2[3]) || (line1[2] === line2[0] && line1[3] === line2[1] && line1[0] === line2[2] && line1[1] === line2[3])

const isBoxMate = (pairLineA: Line, pairLineB: Line, swaped = false): boolean => {
  if (isIdentical(pairLineA, pairLineB)) return false
  const [a1, b1, c1, d1] = pairLineA
  const [a2, b2, c2, d2] = pairLineB
  return (a1 === a2 && b1 === b2) /* Therefore  */
    && (b1 + 1 === d1) /* Then */
    && (a2 + 1 === c2) 
    || (!swaped && isBoxMate(pairLineB, pairLineA, true))
}


const lineIsVertical = (line: Line) => line[0] === line[2]

const generateInstructions = (mouseDownState: MouseDownState) => {
  if (mouseDownState < 3) return "1. Presioná y pasá el cursor por las cajas"
  if (mouseDownState === 3) return "2. Tocá las columnas para generar espacios\n Tocá las cajas para generar puertas"
  return ""
}

const deleteLine = (lines: Line[], lineToDelete: Line) => lines.filter(line => !isIdentical(line, lineToDelete))

export default function Home() {
  const [selected, setSelected] = useState<Line[]>([])

  const [doors, setDoors] = useState<Record<string, boolean>>({})

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
    setDoors({})
    setIsMouseDown(1)
  }

  const renderLine = (line: Line /* "i" parameter will be used when this line is called as the callback of generateLinesForBox (generateLinesForBox.map(renderLine))
  Then, i will represent:
    0 = left
    1 = top
    2 = bottom
    3 = right
  */): JSX.Element => {
    const [a, b, c, d] = line
    const style: React.CSSProperties = {
      position: "absolute"
    }

    if (lineIsVertical(line)) {
      style.top = 0
      style.bottom = 0
      style.left = 0
      style.width = "8px"
    } else {
      style.top = 0
      style.left = 0
      style.right = 0
      style.height = "8px"
    }

    return <div onClick={() => setSelected(deleteLine(selected, line))} className="bg-primary hover:bg-secondary" key={`${a}_${b}_${c}_${d}`} style={{
      position: "absolute",
      ...style
    }}></div>
  }

  const renderSelectedLines = useCallback((selected: Line[]): JSX.Element[] => {
    const pairs: {[k: number]: boolean} = {}
    const result: [Line, Line | null][] = []
    // First we look for the line pair
    outer:
    for (let i = 0; i < selected.length; i++) {
      if (pairs[i]) continue
      for (let j = i + 1; j < selected.length; j++) {
        if (isBoxMate(selected[i]!, selected[j]!)) {
          pairs[j] = true
          result.push([selected[i]!, selected[j]!])
          continue outer
        }
      }
      result.push([selected[i]!, null])
    }

    return result.map(([line, pair]) => {
      const [col, row] = [line[0] + 1, line[1] + 1]
      return (
        <div key={`selected_${col}_${row}`} style={{
          display: "flex",
          position: "relative",
          gridRowStart: row,
          gridColumnStart: col
        }}
          onMouseEnter={() => handleMouseEnter(row, col)}
        >
          {isMouseDown !==  2 ? <div className={`w-full h-full ${doors[`${col}_${row}`] ? "bg-secondary-focus" : ""}`} onClick={() => {setDoors({...doors, [`${col}_${row}`]: true})}}></div> : null}
          {renderLine(line)}
          {pair ? renderLine(pair) : null}
        </div>
      )
    })
  }, [isMouseDown, renderLine])

  const handleMouseEnter = (row: number, col: number) => {
    console.log(col, row)
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
      border: "0.5px dashed black",
      position: "relative"
    }} 
    onMouseDown={() => handleMouseDown(row, col)}
    onMouseEnter={() => handleMouseEnter(row, col)}
  >
    <div className="w-full h-full"></div>
  </div>)), [selected, isMouseDown, handleMouseDown, handleMouseEnter])

  useEffect(() => {
    const handleMouseUp = () => {
      if (isMouseDown === 2) setIsMouseDown(3)
    }

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMouseDown])

  useEffect(() => {
    // void Swal.fire("", "<div style=\"font-size: 20px;\">Seguí las pasos indicados arriba para usar el maquetador. <br/> <br/>Si querés volver a empezar el proceso, tocá en cualquier momento el botón de <b>Reset</b>.</div>", "info")
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

          {canvasBoxes}
          {renderSelectedLines(selected)}

        </div>
      </main>
    </>
  );
}
