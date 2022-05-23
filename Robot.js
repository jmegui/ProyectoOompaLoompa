import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/GLTFLoader.js'
import { Vector3 } from './libs/three.module.js';
 
class Robot extends THREE.Object3D {
  constructor() {
    super();
    this.clock = new THREE.Clock();
    var that = this;
    var loader = new GLTFLoader();
    loader.load( '../models/gltf/robot.glb', ( gltf ) => {
      // El modelo está en el atributo  scene
      this.model= gltf.scene;
      // Y las animaciones en el atributo  animations
      var animations = gltf.animations;
      // No olvidarse de colgar el modelo del Object3D de esta instancia de la clase (this)
      that.add( this.model );

      that.createActions(this.model,animations);
      
      // Se crea la interfaz de usuario que nos permite ver las animaciones que tiene el modelo y qué realizan
    }, undefined, ( e ) => { console.error( e ); }
    );

    this.objetivo = ['fabrica',new Vector3(0,0,0)];
    this.corriendo = false;

    //Genero su posición de manera aleatoria con respecto al centro
    this.rotateY(Math.random()*2*Math.PI);
    this.translateOnAxis(new THREE.Vector3(0,0,-1),75);

    //Almacena la vida y el tiempo de animacion del puñetazo para realizar los golpes
    this.vida = 100;
    this.puñetazo = 0.1;
    this.tiempoMuerto = 0;

    //Creamos la barra de vida
    this.crearBarraDeVida();

    //Almacena el espacio de colision
    const cilindro = new THREE.CylinderGeometry( 1.7, 1.7, 4, 32 );
    var material = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true,opacity: 0.0});
    this.colision = new THREE.Mesh( cilindro, material );
    this.colision.userData = this;
    this.colision.position.y = 2;
    this.add( this.colision );

  }
  
  // ******* ******* ******* ******* ******* ******* ******* 
  
  createActions (model, animations) {
    // Se crea un mixer para dicho modelo
    // El mixer es el controlador general de las animaciones del modelo, 
    //    las lanza, las puede mezclar, etc.
    // En realidad, cada animación tiene su accionador particular 
    //    y se gestiona a través de dicho accionador
    // El mixer es el controlador general de los accionadores particulares
    this.mixer = new THREE.AnimationMixer (model);

    // El siguiente diccionario contendrá referencias a los diferentes accionadores particulares 
    // El diccionario Lo usaremos para dirigirnos a ellos por los nombres de las animaciones que gestionan
    this.actions = {};
    // Los nombres de las animaciones se meten en este array, 
    // para completar el listado en la interfaz de usuario
    this.clipNames = [];
    
    for (var i = 0; i < animations.length; i++) {
      // Se toma una animación de la lista de animaciones del archivo gltf
      var clip = animations[i];
      
      // A partir de dicha animación obtenemos una referencia a su accionador particular
      var action = this.mixer.clipAction (clip);
      
      // Añadimos el accionador al diccionario con el nombre de la animación que controla
      this.actions[clip.name] = action;
            
      // Nos vamos a quedar como animación activa la última de la lista,
      //    es irrelevante cual dejemos como activa, pero el atributo debe referenciar a alguna
      this.activeAction = action;
      
      // Metemos el nombre de la animación en la lista de nombres 
      //    para formar el listado de la interfaz de usuario
      this.clipNames.push (clip.name);
    }
    
  }
  
  createGUI (gui, str) {
    // La interfaz de usuario se crea a partir de la propia información que se ha
    // cargado desde el archivo  gltf
    this.guiControls = {
      // En este campo estará la list de animaciones del archivo
      current : 'Animaciones',
      // Este campo nos permite ver cada animación una sola vez o repetidamente
      repeat : false,
      // Velocidad de la animación
      speed : 1.0
    }
    
    // Creamos y añadimos los controles de la interfaz de usuario
    var folder = gui.addFolder (str);
    var repeatCtrl = folder.add (this.guiControls, 'repeat').name('Repetitivo: ');
    var clipCtrl = folder.add (this.guiControls, 'current').options(this.clipNames).name('Animaciones: ');
    var speedCtrl = folder.add (this.guiControls, 'speed', -2.0, 2.0, 0.1).name('Speed: ');
//     var that = this;
    // Cada vez que uno de los controles de la interfaz de usuario cambie, 
    //    llamamos al método que lance la animación elegida
    clipCtrl.onChange (() => {
      this.fadeToAction (this.guiControls.current, this.guiControls.repeat, this.guiControls.speed);
    });
    repeatCtrl.onChange (() => {
      this.fadeToAction (this.guiControls.current, this.guiControls.repeat, this.guiControls.speed);
    });
    speedCtrl.onChange ((value) => {
      this.activeAction.setEffectiveTimeScale(this.guiControls.speed);
    });
  }
  
  // ******* ******* ******* ******* ******* ******* ******* 
  
  // Método para lanzar una animación
  // Recibe:
  //  - name   : el nombre de la animación
  //  - repeat : si se desea una sola ejecución de la animación (false) o repetidamente (true)
  //  - speed  : la velocidad a la que se moverá la animación (negativo hacia atrás, 0 parado)
  fadeToAction (name, repeat, speed) {
    // referenciamos la animación antigua y la nueva actual
    var previousAction = this.activeAction;
    this.activeAction = this.actions[ name ];
    
    // La nueva animación se resetea para eliminar cualquier rastro de la última vez que se ejecutara
    this.activeAction.reset();
    // Se programa una transición entre la animación actigua y la nueva, se emplea un 10% de lo que dura la animación nueva
    this.activeAction.crossFadeFrom (previousAction, this.activeAction.time/10 )
    // Hacemos que la animación se quede en su último frame cuando acabe
    this.activeAction.clampWhenFinished = true;
    // Ajustamos su factor de tiempo, modificando ese valor se puede ajustar la velocidad de esta ejecución de la animación
    this.activeAction.setEffectiveTimeScale( speed );
    // Ajustamos su peso al máximo, ya que queremos ver la animación en su plenitud
    this.activeAction.setEffectiveWeight( 1 );
    // Se establece el número de repeticiones
    if (repeat) {
      this.activeAction.setLoop (THREE.Repeat);
    } else {
      this.activeAction.setLoop (THREE.LoopOnce);
    }
    // Una vez configurado el accionador, se lanza la animación
    this.activeAction.play();    
  }

  getDistancia(inicio,fin)
  {
      return Math.sqrt(Math.pow(inicio.x - fin.x, 2) + Math.pow(inicio.z - fin.z, 2));
  }
  
  // ******* ******* ******* ******* ******* ******* ******* 

  aproximar(velocidad)
  {
    if(Math.abs(this.objetivo[1].x - this.position.x) >= Math.abs(this.objetivo[1].z - this.position.z))
    {
      if(this.position.x < this.objetivo[1].x)
      {
        var x = this.position.x;
        this.position.x += velocidad;
        this.position.z = (((this.objetivo[1].z - this.position.z)/(this.objetivo[1].x - x)) * (this.position.x - x) + this.position.z);
      }
      else if(this.position.x == this.objetivo[1].x)
      {
          //this.position.z += dt;
      }
      else
      {
        var x = this.position.x;
        this.position.x -= velocidad;
        this.position.z = (((this.objetivo[1].z - this.position.z)/(this.objetivo[1].x - x)) * (this.position.x - x) + this.position.z);
      }
    }
    else
    {
      if(this.position.z < this.objetivo[1].z)
      {
        var z = this.position.z;
        this.position.z += velocidad;
        this.position.x = (((this.objetivo[1].x - this.position.x)/(this.objetivo[1].z - z)) * (this.position.z - z) + this.position.x);
      }
      else if(this.position.z == this.objetivo[1].z)
      {
          this.position.z += velocidad;
      }
      else
      {
        var z = this.position.z;
        this.position.z -= velocidad;
        this.position.x = (((this.objetivo[1].x - this.position.x)/(this.objetivo[1].z - z)) * (this.position.z - z) + this.position.x); }
    }
  }

  eliminarGeometria(modelo){
    if(modelo.children.length==0 && modelo.geometry!=null){
      modelo.geometry.dispose();
    }
    else{
      for(var i = 0; i<modelo.children.length;i++){
        this.eliminarGeometria(modelo.children[i]);
      }
    }
  }

  crearBarraDeVida(){
    const geometria = new THREE.BoxGeometry( 3, 0.3, 0.1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    this.barraVida = new THREE.Mesh( geometria, material );
    this.barraVida.position.y = 5;

    const geometria2 = new THREE.BoxGeometry( 3.1, 0.31, 0.11 );
    const material2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    this.cantidadVida = new THREE.Mesh( geometria2, material2 );
    this.cantidadVida.position.y = 5;

    this.add(this.barraVida);
    this.add(this.cantidadVida);
  }

  actualizarVida(){
    this.cantidadVida.position.x = 1.55;
    this.cantidadVida.scale.set(this.vida/100,1,1);
    this.cantidadVida.position.x = -1.55+1.55*this.vida/100;
  }

  recibeDisparo(){
    this.vida -=35;

    if(this.vida<=0){
      this.vida = 0;
      this.barraVida.geometry.dispose();
      this.barraVida.material.dispose();
      this.cantidadVida.geometry.dispose();
      this.cantidadVida.material.dispose();
      this.eliminarGeometria(this.model);
      this.fadeToAction('Death',false,1);
    }

    this.actualizarVida();
  }
  
  update (pausa, jugador) {
    // Hay que pedirle al mixer que actualice las animaciones que controla
    var dt = this.clock.getDelta();

    if(!pausa){
      if (this.mixer) 
      {
        //Si no esta muerto
        if(this.vida>0){
          var distanciaConJugador = this.getDistancia(this.position,jugador);
          var distanciaMinima = 0;

          //Elijo el objetivo
          if(distanciaConJugador > 20){
            //Si la distancia con el jugador es grande su objetivo es la fabrica
            this.objetivo = ['fabrica',new Vector3(0,0,0)];
            var distanciaConObjetivo = this.getDistancia(this.position,this.objetivo[1]);
            distanciaMinima = 10;
          }
          else{
            //Si la distancia con el jugador es pequeña su objetivo es el jugador
            this.objetivo = ['jugador',jugador];
            var distanciaConObjetivo = this.getDistancia(this.position,this.objetivo[1]);
            distanciaMinima = 7;
          }

          //Elijo la accion a aplicar
          if(distanciaConObjetivo > distanciaMinima)
          {
            if(!this.corriendo)
            {
                this.corriendo = true;
                this.fadeToAction('Walking',true,1);
            }
      
            var velocidad = 2 * dt;
            this.aproximar(velocidad);
            this.puñetazo = 0.1;
          }
          else
          {
            if(this.corriendo)
            {
              this.fadeToAction('Punch',true,1);
            }
            this.corriendo = false;
          
            this.puñetazo+=dt*2;
            if(this.puñetazo>=1){
              this.puñetazo = 0;
            }
          }

          this.lookAt(this.objetivo[1]);
        }
        else{
          this.tiempoMuerto+=dt;
        }
        this.mixer.update (dt)
      }
    }
  }





}



export { Robot };
