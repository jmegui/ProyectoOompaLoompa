import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 
import {Consumible} from './Consumible.js'

class Reparacion extends Consumible {
  constructor() {
    super();
    
    /*-----------CREACION-ELEMENTOS-------------*/
    this.cargarModelo();
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
  
  //Comprueba si esta intersectando y aplica el efecto
  intersecta(escena){
    if(this.getDistancia(this.position,escena.jugador.position)<2.5){
      escena.fabrica.vida += 100;
      if(escena.fabrica.vida>500) escena.fabrica.vida = 500;
      return true;
    }

    return false;
  }
}



export { Reparacion };
