import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";

const rows = [2,3,4,5,6,7]
const columns = [2,3,4,5,6,7]

export default function Home() {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const resetSelected = useCallback(() => setSelected({}), [])

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false)

  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false)
    }

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleMouseDown = (row: number, col: number) => {
    if (selected[`${row}_${col}`]) {
      setDeleteMode(true)
    } else {
      setDeleteMode(false)
    }
    setSelected({...selected, [`${row}_${col}`]: !selected[`${row}_${col}`]})
    setIsMouseDown(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown) {
      setSelected({...selected, [`${row}_${col}`]: deleteMode ? false : true})
    }
  };

  const canvasBoxes = useMemo(() => rows.map((row) => {
    return columns.map((col) => {
      return <div key={`${row}_${col}`} style={{
        gridRowStart: row,
        gridColumnStart: col,
        border: `${selected[`${row}_${col}`] ? "4px solid black" : "0.25px solid black"}`
      }} 
        onMouseDown={() => handleMouseDown(row, col)}
        onMouseEnter={() => handleMouseEnter(row, col)}
      ></div>
    })
  }).flat(), [selected, isMouseDown])

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <div className={`min-h-screen modules-canvas`}>

          <div className="row-start-1 col-start-7 flex items-center justify-center">
            <button className="btn btn-primary" onClick={resetSelected}>Reset</button>
          </div>

          {canvasBoxes}

        </div>
      </main>
    </>
  );
}
