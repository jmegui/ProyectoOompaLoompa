import * as THREE from '../libs/three.module.js'
 
class Corazon extends THREE.Object3D {
  constructor() {
    super();

    /*-----------CREACION-ELEMENTOS-------------*/
    this.crearGeometria();
    this.rotateZ(Math.PI);
    this.scale.set(0.02,0.02,0.02);

    //Genero su posición de manera aleatoria con respecto al centro
    var distanciaAleatoria = Math.random()*(100-10)+20;
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),distanciaAleatoria);
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

//Calcula distancia entre dos puntos a la altura del suelo
  getDistancia(inicio,fin){
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }
  
  //Comprueba si esta intersectando y aplica el efecto
  intersecta(escena){
    if(this.getDistancia(this.position,escena.jugador.position)<2){
      escena.jugador.vida += 20;
      if(escena.jugador.vida>100) escena.jugador.vida = 100;
      this.objeto.geometry.dispose();
      return true;
    }

    return false;
  }
  
  update () {
    this.rotation.y += 0.01;
  }
}

export { Corazon };
