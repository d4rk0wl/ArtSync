import {Vibrant} from 'node-vibrant/node';

const getColors: (filePath: string) => Promise<number[][]> = async (filePath) => {
  const isRgbArray = (arr: any): arr is [number, number, number] => {
    return Array.isArray(arr) && arr.length === 3 && arr.every(n => typeof n === 'number')
  }

  let v = new Vibrant('./tmp/thumb.jpg')
  const palette = await v.getPalette()

  return [
    palette.Vibrant?.rgb,
    palette.LightVibrant?.rgb,
    palette.DarkVibrant?.rgb
  ].filter(isRgbArray)
}

export default getColors