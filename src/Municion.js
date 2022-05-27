import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/GLTFLoader.js'
import {Consumible} from './Consumible.js'
 
class Municion extends Consumible {
  constructor() {
    super();

    /*-----------CREACION-ELEMENTOS-------------*/
    this.cargarModelo();
    this.scale.set(0.1,0.1,0.1);
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
  
  //Comprueba si esta intersectando y aplica el efecto
  intersecta(escena){
    if(this.getDistancia(this.position,escena.jugador.position)<3.5){
      escena.addMunicion();
      return true;
    }

    return false;
  }
}



export { Municion };
