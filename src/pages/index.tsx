import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Line, MouseDownState, deleteLine, generateInstructions, generateLinesForBox, getBoxPositionForLine, isBoxMate, isIdentical, lineIsVertical } from "~/utils/modulesLogic";

class TupleSet {
  private map: Map<string, {position: [number, number], lines: Line[]}> = new Map();

  add(tuple: [number, number], lines: Line[]) {
    const key = tuple.join(',');
    const existingLines = this.map.get(key)?.lines
    this.map.set(key, {position: tuple, lines: existingLines ? [...existingLines, ...lines] : lines });
  }

  has(tuple: [number, number]) {
    const key = tuple.join(',');
    return this.map.has(key);
  }

  delete(tuple: [number, number]) {
    const key = tuple.join(',');
    this.map.delete(key);
  }

  difference(otherSet: TupleSet): TupleSet {
    const diffSet = new TupleSet();
    this.map.forEach((value, key) => {
      if (!otherSet.has(value.position)) {
        diffSet.add(value.position, value.lines);
      }
    });
    return diffSet;
  }

  toArray(): {position: [number, number], lines: Line[]}[] {
    return Array.from(this.map.values());
  }
}

const rows = [2,3,4,5,6,7]
const columns = [2,3,4,5,6,7]
const canvasBoxes = rows.flatMap(row => columns.map(col => [col, row] as [number, number]))
const canvasBoxesSet = new TupleSet()
canvasBoxes.forEach(box => canvasBoxesSet.add(box, []))

export default function Home() {
  const [selected, setSelected] = useState<Line[]>([])
  const [doors, setDoors] = useState<Record<string, boolean>>({})
  const [isMouseDown, setIsMouseDown] = useState<MouseDownState>(1);

  const resetSelected = () => {
    setSelected([])
    setDoors({})
    setIsMouseDown(1)
  }

  const renderLine = (line: Line): JSX.Element => {
    const [a, b, c, d] = line
    const style: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0
    }

    if (lineIsVertical(line)) {
      style.bottom = 0
      style.width = "8px"
    } else {
      style.right = 0
      style.height = "8px"
    }

    return <div onClick={() => setSelected(deleteLine(selected, line))} className={`bg-primary hover:bg-secondary ${isMouseDown === 2 ? "pointer-events-none" : ""}`} key={`${a}_${b}_${c}_${d}`} style={style}></div>
  }


  const handleDoors = (row: number, col: number) => {
    if (isMouseDown === 3) return setDoors({...doors, [`${col}_${row}`]: true})
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown === 2) {
      const lines = generateLinesForBox(row, col)
      const newLines = lines.filter(line => !selected.some(existingLine => isIdentical(line, existingLine)))
      setSelected([...selected, ...newLines])
    }
  };

  const canvasBoxes = useMemo(() => {
    const handleMouseDown = (row: number, col: number) => {
      if (isMouseDown !== 1) return
      const lines = generateLinesForBox(row, col)
      const newLines = lines.filter(line => !selected.some(existingLine => isIdentical(line, existingLine)))
      setSelected([...selected, ...newLines])
      setIsMouseDown(2);
    };
    const selectedBoxes = new TupleSet()
    selected.forEach((line) => selectedBoxes.add(getBoxPositionForLine(line), [line]))

    const diffSet = canvasBoxesSet.difference(selectedBoxes)

    const selectedBoxesElements = selectedBoxes.toArray().map(box => {
      const boxIsOutOfCanvas = box.position[0] < columns[0]! || box.position[0] > columns[columns.length - 1]! || box.position[1] < rows[0]! || box.position[1] > rows[rows.length - 1]!
      return <div className={`${doors[`${box.position[0]}_${box.position[1]}`] ? "bg-accent" : ""} ${boxIsOutOfCanvas ? "pointer-events-none" : ""}`} key={`${box.position[0]}_${box.position[1]}`}
      style={{
        gridRowStart: box.position[1],
        gridColumnStart: box.position[0],
        border: boxIsOutOfCanvas ? "none" : "0.5px dashed black",
        position: "relative"
      }} 
      onMouseDown={() => handleMouseDown(box.position[1], box.position[0])}
      onMouseEnter={() => handleMouseEnter(box.position[1], box.position[0])}
      onClick={() => handleDoors(box.position[1], box.position[0])}
    >
        {box.lines.map(renderLine)}
    </div>
    })

    const regularBoxesElements = diffSet.toArray().map(box => {
      return <div className={`${doors[`${box.position[0]}_${box.position[1]}`] ? "bg-accent" : ""}`} key={`${box.position[0]}_${box.position[1]}`}
      style={{
        gridRowStart: box.position[1],
        gridColumnStart: box.position[0],
        border: "0.5px dashed black",
        position: "relative"
      }} 
      onMouseDown={() => handleMouseDown(box.position[1], box.position[0])}
      onMouseEnter={() => handleMouseEnter(box.position[1], box.position[0])}
      onClick={() => handleDoors(box.position[1], box.position[0])}
    >
    </div>})

    return [
      ...selectedBoxesElements,
      ...regularBoxesElements
    ]

  }, [isMouseDown, handleMouseEnter, doors, selected])

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
          <div className="row-start-1 col-start-2 col-end-6 flex items-center text-">
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {generateInstructions(isMouseDown).map((instruction, i) => <div key={i}><span>{instruction}</span></div>)}
            </div>
          </div>

          {canvasBoxes}

        </div>
      </main>
    </>
  );
}
