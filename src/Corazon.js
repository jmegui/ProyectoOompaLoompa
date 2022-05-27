import * as THREE from '../libs/three.module.js'

import {Consumible} from './Consumible.js'
 
class Corazon extends Consumible {
  constructor() {
    super();

    /*-----------CREACION-ELEMENTOS-------------*/
    this.crearGeometria();
    this.rotateZ(Math.PI);
    this.scale.set(0.02,0.02,0.02);
    this.position.y = 3;
  }

/*______________________________________________________________________________________________________________________*/
/*_______________________________________CREACION-DEL-OBJETO____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  crearGeometria(){
    var shape = new THREE.Shape();

    
    shape.moveTo( 25, 25 );
    shape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
    shape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
    shape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
    shape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
    shape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
    shape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

    const extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 9, steps: 8, bevelSize: 10, bevelThickness: 10 };

    var BarridoGeom = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    // Como material se crea uno a partir de un color
    var BarridoMat = new THREE.MeshToonMaterial({color: 0xCF0000});
    // Ya podemos construir el Mesh
    this.objeto = new THREE.Mesh (BarridoGeom, BarridoMat);


    this.add (this.objeto);
  }

/*______________________________________________________________________________________________________________________*/
/*__________________________________________________ACCIONES____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/
  
  //Comprueba si esta intersectando y aplica el efecto
  intersecta(escena){
    if(this.getDistancia(this.position,escena.jugador.position)<2.5){
      escena.jugador.vida += 20;
      if(escena.jugador.vida>100) escena.jugador.vida = 100;
      return true;
    }

    return false;
  }
}

export { Corazon };
