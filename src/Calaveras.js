import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 
import {Consumible} from './Consumible.js'
 
class Calaveras extends Consumible {
  constructor() {
    super();

    /*-----------CREACION-ELEMENTOS-------------*/
    this.cargarModelo();
    this.position.y = 1;

  }

/*______________________________________________________________________________________________________________________*/
/*_______________________________________CREACION-DEL-OBJETO____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  cargarModelo(){
    //Cargamos el modelo de las calaveras
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('../models/calaveras/Skulls.mtl',
        ( materials ) => {
          objectLoader.setMaterials(materials);
          objectLoader.load ('../models/calaveras/Skulls.obj',
            (object) => {
              this.object = object;

              this.object.rotateX(-Math.PI/2);
              this.object.scale.set(0.1,0.1,0.1);

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
      escena.eliminarTodosLosEnemigos();
      return true;
    }

    return false;
  }
}



export { Calaveras };
