import * as THREE from '../libs/three.module.js'

import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 
 
class Torreta extends THREE.Object3D {
  constructor() {
    super();

    this.clock = new THREE.Clock();

    //Cargamos el modelo de la torreta
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('../models/torreta/torreta.mtl',
        ( materials ) => {
          
          objectLoader.setMaterials(materials);
          objectLoader.load ('../models/torreta/torreta.obj',
            (object) => {
              this.object = object;

              this.object.position.y-=1;
              this.object.rotateY(-Math.PI/2);

              this .add (this.object) ;
            }, null, null);
          });

    //Creo el indicador de colocación
    this.crearIndicadorColocacion();

    this.position.y+=1;

    this.fijada = false;

    this.tiempoViva = 0;
    this.esperaDisparo = 0;

  }

  crearIndicadorColocacion(){
    const geometry = new THREE.CylinderGeometry( 5, 5, 10, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.5} );
    this.colocacion = new THREE.Mesh( geometry, material );
    this.colocacion.position.y += 1;
    this.add( this.colocacion );
  }

  getDistancia(inicio,fin)
  {
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }

  fijarTorreta(){
    this.fijada = true;
    this.colocacion.geometry.dispose();
    this.remove(this.colocacion);
  }
  
  update (robots, escena, posicion) {
    var dt = this.clock.getDelta();
    this.tiempoViva += dt;
    this.esperaDisparo += dt;

    //Actualizo el objetivo si ha pasado 0.7 s
    if(this.esperaDisparo>=0.7 && robots!=null){
      var masCercano = null;

      for(var i = 0; i<robots.length; i++){
        if(this.getDistancia(this.position,robots[i].position)<40){
          //Si no hay aun nadie al alcance elige a ese robot
          if(masCercano==null){
            masCercano=robots[i];
          }
          //Si existe alguien más cercano lo sustituye
          else if(this.getDistancia(this.position,masCercano.position)>this.getDistancia(this.position,robots[i].position)){
            masCercano=robots[i];
          }
        }
      }
  
      if(masCercano!=null){
        this.lookAt(masCercano.position);
        var direccion = new THREE.Vector3(masCercano.position.x-this.position.x,masCercano.position.y-this.position.y,masCercano.position.z-this.position.z);
        escena.instanciarProyectil(this.position,direccion,robots,0xFF00FF);
      }

      this.esperaDisparo = 0
    }

      //Si no esta fijada actualizo su posicion
    if(!this.fijada){
      this.position.x = posicion.x;
      this.position.y = posicion.y;
      this.position.z = posicion.z;
    }
  }
}

export { Torreta };
