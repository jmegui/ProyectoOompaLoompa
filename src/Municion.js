import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/GLTFLoader.js'
 
class Municion extends THREE.Object3D {
  constructor() {
    super();

    /*-----------CREACION-ELEMENTOS-------------*/
    this.cargarModelo();

    this.scale.set(0.1,0.1,0.1);
    //Genero su posición de manera aleatoria con respecto al centro
    var distanciaAleatoria = Math.random()*(100-10)+20;
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),distanciaAleatoria);
    this.position.y = 1;

  }

/*______________________________________________________________________________________________________________________*/
/*_______________________________________CREACION-DEL-OBJETO____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

cargarModelo(){
  //Cargamos el modelo del robot
  var loader = new GLTFLoader();
  loader.load( '../models/municion/cajaMunicion.gltf', ( gltf ) => {
    // El modelo está en el atributo  scene
    this.model= gltf.scene;
    // Y las animaciones en el atributo  animations
    // No olvidarse de colgar el modelo del Object3D de esta instancia de la clase (this)
    this.add( this.model );
    
    // Se crea la interfaz de usuario que nos permite ver las animaciones que tiene el modelo y qué realizan
  }, undefined, ( e ) => { console.error( e ); }
  );
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
      escena.addMunicion();
      return true;
    }

    return false;
  }

  
  update () {
    this.rotation.y += 0.01;
  }
}



export { Municion };
