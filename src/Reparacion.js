import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 

class Reparacion extends THREE.Object3D {
  constructor() {
    super();
    
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

    this.objeto = this;

    //Genero su posición de manera aleatoria con respecto al centro
    var distanciaAleatoria = Math.random()*(100-10)+20;
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),distanciaAleatoria);
    this.position.y = 3;

    this.tipo = "reparacion";
  }
  
  getDistancia(inicio,fin)
  {
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }
  
  intersecta(jugador){
    return (this.getDistancia(this.position,jugador.position)<2);
  }

  
  update () {
    // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
    // Primero, el escalado
    // Segundo, la rotación en Z
    // Después, la rotación en Y
    // Luego, la rotación en X
    // Y por último la traslación

    this.rotation.y += 0.01;
  }
}



export { Reparacion };
