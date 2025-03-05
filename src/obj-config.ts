import { degToRad } from "three/src/math/MathUtils.js";
interface Position {
   x: number;
   y: number;
   z: number;
   rotation: number;
}

interface Scale {
   x: number;
   y: number;
   z: number;
}

interface ObjConfig {
   name: string;
   path: string;
   pos: Position;
   scale: Scale;
}

const objs: ObjConfig[] = [
   {
      name: 'telecaster',
      path: 'models/telecaster.obj',
      pos: {
         x: -2.8,
         y: -1,
         z: 0,
         rotation: degToRad(-65), // deg / 180 * Math.PI 
      },
      scale: {
         x: 1.5,
         y: 1.5,
         z: 1.5,
      }
   },
   {
      name: 'speaker',
      path: 'models/speaker.obj',
      pos: {
         x: -2.4,
         y: 1.4,
         z: 0,
         rotation: degToRad(-90)
      },
      scale: {
         x: 1.3,
         y: 1.3,
         z: 1.3
      }
   },
   {
      name: 'DNA',
      path: 'models/dna.obj',
      pos: {
         x: 0.1,
         y: 0.2,
         z: 0,
         rotation: degToRad(-90)
      },
      scale: {
         x: 1.5,
         y: 1.5,
         z: 1.5
      }
   }
];

const OBJECT_COUNT = objs.length;

export { objs, OBJECT_COUNT };