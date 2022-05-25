import * as THREE from '../libs/three.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import * as TWEEN from '../libs/tween.esm.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js' 

 
class Jugador extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();

    this.clock = new THREE.Clock();

    //Valores posicion y avance
    this.vertical = new THREE.Vector3(0,1,0);
    this.frente = new THREE.Vector3(1,0,0);
    this.cantidadAvance = 12;

    //Almacena inclinacion cabeza
    this.inclinacion = 0;

    //Administrar salto
    this.saltando = false;
    this.direccionAlmacenada = {a:0,l:0};
    
    this.crearCameraPrimeraPersona();



    //Carga el modelo de la pistola
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('/models/pistola/11684_gun_v1_l3.mtl',
        ( materials ) => {
          objectLoader.setMaterials(materials);
          objectLoader.load ('/models/pistola/11684_gun_v1_l3.obj',
            (object) => {
              this.pistola = object;
              this.pistola.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI);
              this.pistola.rotateOnAxis(new THREE.Vector3(1,0,0),-90*Math.PI/180);
              this.pistola.scale.x=0.1;
              this.pistola.scale.y=0.1;
              this.pistola.scale.z=0.1;

              //Creo el efecto de disparo
              this.crearEfectoDisparo();
              this .add (this.pistola) ;

              this.pistola.position.x += 2; 
              this.pistola.position.y += 1;
              this.pistola.position.z += 1;
            }, null, null);
          });
    

      //Almacenamos el porcentaje de vida del jugador
      this.vida = 100;

      //Gestionar disparo
      this.disparando = false;
      this.tiempoDisparo = 0;

      this.translateOnAxis(new THREE.Vector3(1,0,0),-30);
  }

  crearCameraPrimeraPersona(){

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 3, 0);
    // Y hacia dónde mira
    this.look = new THREE.Vector3 (1,3,0);
    this.camera.lookAt(this.look);
    this.add (this.camera);
  }

  crearEfectoDisparo(){
    var geometria = new THREE.BoxGeometry (10,10,0.1);
    var textura = new THREE.TextureLoader().load('../imgs/disparo.png');
    var material = new THREE.MeshBasicMaterial ({map: textura, transparent: true , opacity:0.6});
    
    // Ya se puede construir el Mesh
    this.efectoD  = new THREE.Mesh (geometria, material);

    this.efectoD.rotateX(Math.PI/2);
    this.efectoD.rotateY(Math.PI/2);
    this.efectoD.position.z += 13;
    this.efectoD.position.x -= 11.5;
    this.efectoD.position.y -=1;
  }

  //Para realizar el movimiento del jugador si no está saltando
  avanzar(adelante,derecha){
    if(!this.saltando){
      if(adelante && derecha){
        var distancia = Math.sqrt(2*this.cantidadAvance*this.cantidadAvance);
        this.translateOnAxis (this.frente, this.dt*(adelante*distancia/2));
        this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(derecha*distancia/2));
      }

      else if(derecha)
        this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.cantidadAvance*derecha));

      else if(adelante)
        this.translateOnAxis (this.frente, this.dt*(this.cantidadAvance*adelante));
  
    }
  }

  //Para aplicar el desplazamiento almacenado en el momento del salto
  aplicarDesplazamientoAlmacenado(){
    if(this.direccionAlmacenada.a && this.direccionAlmacenada.l){
      var distancia = Math.sqrt(this.cantidadAvance*this.cantidadAvance);
      this.translateOnAxis (this.frente, this.dt*(this.direccionAlmacenada.a*distancia/2));
      this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.direccionAlmacenada.l*distancia/2));
    }

    else if(this.direccionAlmacenada.l)
      this.translateOnAxis (new THREE.Vector3(0,0,1), this.dt*(this.cantidadAvance*this.direccionAlmacenada.l));

    else if(this.direccionAlmacenada.a)
      this.translateOnAxis (this.frente, this.dt*(this.cantidadAvance*this.direccionAlmacenada.a));
  }

  //Para girar cámara con el ratón
  girarCamara(x,y){
    //Espero a que ser cargue el modelo de la pistola
    if(this.pistola){
      this.rotateOnAxis (this.vertical, -x/500);

      //Limita el giro de la cabeza hacia arriba y abajo
      if((y<0 && this.inclinacion>(-90*Math.PI/180)) || (y>0 && this.inclinacion<(90*Math.PI/180))){
        this.inclinacion += y/500;
        this.camera.rotateOnAxis(this.frente,-y/500);
        this.pistola.rotateOnAxis(new THREE.Vector3(0,1,0),-y/500);
      }
    }
  }

  getCamera(){
    return this.camera;
  }

  saltar(adelante,atras,derecha,izquierda, velocidad){
    if(!this.saltando){
      this.saltando = true;

      if(adelante) this.direccionAlmacenada.a = velocidad;
      else if(atras) this.direccionAlmacenada.a = -velocidad;

      if(derecha) this.direccionAlmacenada.l = velocidad;
      else if(izquierda) this.direccionAlmacenada.l = -velocidad;

      var origen = {y: this.position.y}; 
      var destino = {y: this.position.y+2};
      var suelo = {y: this.position.y}; 

      var caer=new TWEEN.Tween(destino).to(suelo,300).easing(TWEEN.Easing.Quadratic.In).onComplete(()=>{this.saltando = false;this.direccionAlmacenada={a:0,l:0};});

      var saltar=new TWEEN.Tween(origen).to(destino,300).easing(TWEEN.Easing.Quadratic.Out).chain(caer);

      saltar.onUpdate ( ( ) =>{
        this.position.y = origen.y;
      });

      caer.onUpdate ( ( ) =>{
        this.position.y = destino.y;
      });

      saltar.start();
    }
  }
  
  disparo(){
    this.pistola.add(this.efectoD);
    this.disparando = true;
  }

  aplicarEfectoDisparo(){
    this.tiempoDisparo += this.dt;

    if(this.tiempoDisparo>=0.1){
      this.pistola.remove(this.efectoD);
      this.tiempoDisparo = 0;
      this.disparando = false;
    }
  }

  
  update (pausa) {
    this.dt = this.clock.getDelta();

    if(!pausa){
      TWEEN.update();
      //Si estoy saltando aplico el desplazamiento almacenado en el momento del salto
      if(this.saltando){
        this.aplicarDesplazamientoAlmacenado();
      }

      if(this.disparando){
        this.aplicarEfectoDisparo();
      }

      // this.actualizarProyectiles();

    }

  }
}

export { Jugador };
