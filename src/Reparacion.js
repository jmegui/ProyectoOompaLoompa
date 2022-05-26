import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 

class Reparacion extends THREE.Object3D {
  constructor() {
    super();
    
    /*-----------CREACION-ELEMENTOS-------------*/
    this.cargarModelo();

    //Genero su posición de manera aleatoria con respecto al centro
    var distanciaAleatoria = Math.random()*(100-10)+20;
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),distanciaAleatoria);
    this.position.y = 3;
  }

/*______________________________________________________________________________________________________________________*/
/*_______________________________________CREACION-DEL-OBJETO____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  cargarModelo(){
    //Cargamos el modelo de las calaveras
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('../models/llave/wrench.mtl',
        ( materials ) => {
          objectLoader.setMaterials(materials);
          objectLoader.load ('../models/llave/wrench.obj',
            (object) => {
              this.object = object;

              this.object.rotateX(-Math.PI/2);
              this.object.scale.set(0.5,0.5,0.5);

              this .add (this.object) ;
            }, null, null);
          });
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
      escena.fabrica.vida += 100;
      if(escena.fabrica.vida>500) escena.fabrica.vida = 500;
      return true;
    }

    return false;
  }

  
  update () {
    this.rotation.y += 0.01;
  }
}



export { Reparacion };
