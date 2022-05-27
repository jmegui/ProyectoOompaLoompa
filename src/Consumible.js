import * as THREE from '../libs/three.module.js'
 
class Consumible extends THREE.Object3D {
  constructor() {
    super();
  }
/*______________________________________________________________________________________________________________________*/
/*__________________________________________________ACCIONES____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  nuevaPosicion(){
    this.position.x = 0;
    this.position.y = 0;
    this.position.z = 0;
    //Genero su posición de manera aleatoria con respecto al centro
    var distanciaAleatoria = Math.random()*(100-10)+20;
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),distanciaAleatoria);

    return this;
  }

//Calcula distancia entre dos puntos a la altura del suelo
  getDistancia(inicio,fin){
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }
  
  update () {
    this.rotation.y += 0.01;
  }
}

export { Consumible };
