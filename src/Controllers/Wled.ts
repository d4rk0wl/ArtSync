interface SegmentUpdate {
  id: number;
  col: number[][];
}

let segmentCache: number[] | null = null;

const getSelectedSegments: () => number[] = () => {
  if(segmentCache) return segmentCache;

  const raw = process.env.SEGMENTS
  if(raw){
    try{
      const selectedSegments = JSON.parse(raw)
      segmentCache = selectedSegments
      return selectedSegments;
    } catch {
      throw new Error("Invalid segment array in environment variables")
    }
  } else {
    throw new Error("No segments configured in environment variables")
  }
}

const applyUpdate: (colors: number[][]) => Promise<void> = async (colors) => {
  const selectedSegments = getSelectedSegments()

  const currentState = await fetch(`http://${process.env.WLEDADDR}/json/state`)

  if(!currentState.ok){
    throw new Error(`Unable to fetch state from ${process.env.WLEDADDR}: ${currentState.statusText}`)
  }

  const data = await currentState.json();
  const currentSegments = data.seg;

  const updates = currentSegments.map((seg: SegmentUpdate) => {
    if(selectedSegments.includes(seg.id)){
      return(
        {...seg, col: colors}
      )
    } else {
      return seg
    }
  })

  const updatedState = await fetch(`http://${process.env.WLEDADDR}/json/state`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({seg: updates})
  });

  if(!updatedState.ok){
    throw new Error(`Unable to apply state updates to ${process.env.WLEDADDR}: ${updatedState.statusText}`)
  }
}

export default applyUpdate