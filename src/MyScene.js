
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../../libs/dat.gui.module.js'
import { TrackballControls } from '../../libs/TrackballControls.js'
import { Stats } from '../../libs/stats.module.js'
// Clases de mi proyecto

import {Robot} from './Robot.js'

import { Jugador } from './Jugador.js'

import {Fabrica} from './Fabrica.js'

import {Corazon} from './Corazon.js'

import {Reparacion} from './Reparacion.js'

import {Calaveras} from './Calaveras.js'

import {Proyectil} from './Proyectil.js'

import {Torreta} from './Torreta.js'
 
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();


    this.proyectiles = [];
    
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    
    // Se añade a la gui los controles para manipular los elementos de esta clase
    // this.gui = this.createGUI ();
    
    this.initStats();

    this.clock = new THREE.Clock();
    
    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();
    
    // Un suelo 
    this.createGround ();

    //El entorno
    this.createEntorno();

    //Almacena si el juego se encuentra en pausa
    this.pausa = false;
    
    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper (5);
    this.add (this.axis);

    //Para indicar el fin de partida
    this.finPartida = false;
    
    // El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a 
    // la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
    this.jugador = new Jugador(this.gui, "Controles de la Caja");
    //Asignamos como cámara la cámara del jugador
    this.camera = this.jugador.getCamera();

    this.add (this.jugador);

    //Para la pulsacion de teclas (izquierda, arriba, derecha, abajo) (w,a,s,d) (construir torreta)
    this.map = {37: false, 38: false, 39: false, 40: false, 87: false, 65: false, 83: false, 68:false, 32:false, 16: false, 84:false};

    //Creo a los enemigos en un array y un temporizador para ir generandolos
    this.umpalumpas = [new Robot()];
    this.add(this.umpalumpas[0]);
    this.tempEnemigos = 0;

    for(var i = 0; i<9; i++){
      this.umpalumpas.push(new Robot());
      this.add(this.umpalumpas[i+1]);
    }

    //Añado la fabrica
    this.fabrica = new Fabrica();

    this.add(this.fabrica);

    //Creo una variable para almacenar el tiempo de duración de la partida, las muertes realizadas y el dinero
    this.tiempo = 0;
    this.muertesTotales = 0;
    this.dinero = 0;
    
    //Añado variable consumible y un contador para la aparición de consumibles cada 15s
    this.consumible = null;
    this.tiempoConsumible = 0;

    //Pruebas torreta
    this.modoConstruirTorreta = false;
    this.torretaEnConstruccion = null;
    this.torretas = [];
    //this.add(this.torretas[0]);

    this.noche = false;
  }
  
  initStats() {
  
    var stats = new Stats();
    
    stats.setMode(0); // 0: fps, 1: ms
    
    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    
    $("#Stats-output").append( stats.domElement );
    
    this.stats = stats;
  }

  createEntorno() {
    var path = "./entorno/"
  var format = '.png'
  var urls = [
  path + 'px' + format , path + 'nx' + format ,
  path + 'py' + format , path + 'ny' + format ,
  path + 'pz' + format , path + 'nz' + format
  ] ;
var textureCube = new THREE.CubeTextureLoader().load (urls) ;
this.background = textureCube ;
  }


  createGround () {
    // El suelo es un Mesh, necesita una geometría y un material.
    
    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry (500,0.2,500);
    
    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('../imgs/nieve.png');
    var materialGround = new THREE.MeshPhongMaterial ({map: texture});
    
    // Ya se puede construir el Mesh
    this.ground = new THREE.Mesh (geometryGround, materialGround);
    
    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    this.ground.position.y = -0.1;
    
    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add (this.ground);
  }
  
  // createGUI () {
  //   // Se crea la interfaz gráfica de usuario
  //   var gui = new GUI();
    
  //   // La escena le va a añadir sus propios controles. 
  //   // Se definen mediante un objeto de control
  //   // En este caso la intensidad de la luz y si se muestran o no los ejes
  //   this.guiControls = {
  //     // En el contexto de una función   this   alude a la función
  //     lightIntensity : 0.5,
  //     axisOnOff : true
  //   }

  //   // Se crea una sección para los controles de esta clase
  //   var folder = gui.addFolder ('Luz y Ejes');
    
  //   // Se le añade un control para la intensidad de la luz
  //   folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1)
  //     .name('Intensidad de la Luz : ')
  //     .onChange ( (value) => this.setLightIntensity (value) );
    
  //   // Y otro para mostrar u ocultar los ejes
  //   folder.add (this.guiControls, 'axisOnOff')
  //     .name ('Mostrar ejes : ')
  //     .onChange ( (value) => this.setAxisVisible (value) );
    
  //   return gui;
  // }
  
  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.10);
    // La añadimos a la escena
    this.add (ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight( 0xffffff);
    this.spotLight.position.set( -60, 70, 0 );
    this.add (this.spotLight);
    this.setLightIntensity(1);
  }
  
  setLightIntensity (valor) {
    this.spotLight.intensity = valor;
  }
  
  setAxisVisible (valor) {
    this.axis.visible = valor;
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }
  
  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  

  actualizarBarrasDeVida(){
    document.getElementById("vidaFabrica").style.width=this.fabrica.vida/5+"%";
    document.getElementById("porcentajeVidaF").textContent="Fabrica/"+this.fabrica.vida/5+"%";
    document.getElementById("vidaJugador").style.width=this.jugador.vida+"%";
    document.getElementById("porcentajeVidaJ").textContent="Jugador/"+this.jugador.vida+"%";
  }

  //Comprobar pausa
  comprobarPausa(){
    this.pausa = (document.pointerLockElement!=document.body);
    //Si lo esta mostramos el letrero de pausa, si no lo ocultamos y se actualiza el contador de partida
    if(this.pausa){
      this.clock.getDelta();
      document.getElementById("letreroPausa").style.display="block";
    }
    else{
      document.getElementById("letreroPausa").style.display="none";
      //Actualizamos el contador de partida y temporizador de enemigos
      var dt = this.clock.getDelta();
      this.tiempo += dt;
      this.tempEnemigos += dt;
      this.tiempoConsumible += dt;
      document.getElementById("tiempoPartida").textContent=Math.round(this.tiempo);
    }
  }

  //Actualizo el estado de los enemigos
  actualizarEnemigos(){
    for(var i = 0; i<this.umpalumpas.length; i++){
      this.umpalumpas[i].update(this.pausa,this.jugador.position);

      //Si el robot esta golpeando se actualiza la vida del jugador o de la fabrica
      if(this.umpalumpas[i].puñetazo==0 && !this.pausa){
        if(this.umpalumpas[i].objetivo[0]=='fabrica' && this.fabrica.vida>0)
          this.fabrica.vida-=this.umpalumpas[i].daño;
        else if(this.jugador.vida>0)
          this.jugador.vida-=this.umpalumpas[i].daño;
      }

      //Si hace 0.5 segundos que ha muerto se elimina y se añade nuevo enemigo
      if(this.umpalumpas[i].tiempoMuerto>0.5){
        this.remove(this.umpalumpas[i]);
        this.muertesTotales ++;
        this.dinero+=5;
        document.getElementById("muertes").textContent = this.muertesTotales;
        document.getElementById("dinero").textContent = this.dinero+" $";
        this.umpalumpas.splice(i,1);
        //Si hay menos de 5 enemigos añado uno
        if(this.umpalumpas.length<6 || this.tempEnemigos>=2){
          this.umpalumpas.push(new Robot());
          this.add(this.umpalumpas[this.umpalumpas.length-1]);
          //Si el temporizador ha llegado a 4 se reinicia
          if(this.tempEnemigos>=2) this.tempEnemigos = 0;
        }
      }
    }
  }

  //Se aplican los controles al jugador
  aplicarControles(){
    var adelante = 0;
    var lateral = 0;

    //Se comprueba si esta corriendo con el shift
    var velocidad = 1;
    if(this.map[16]) 
      velocidad = 1.8;

    if ((this.map[38] || this.map[87]) && !(this.map[40] || this.map[83])) {
      adelante = velocidad;
    }
    else if (this.map[40] || this.map[83]) {
      adelante = -velocidad;
    }
    if ((this.map[39] || this.map[68]) && !(this.map[37] || this.map[65])) {
      lateral = velocidad;
    }
    if (this.map[37] || this.map[65]){
      lateral = -velocidad;
    }

    if(!this.pausa) this.jugador.avanzar(adelante,lateral);

    //Se ejecuta el salto y se le pasa la direccion de ese momento y la velocidad
    if(this.map[32]){
      this.jugador.saltar(this.map[38]||this.map[87], this.map[40]||this.map[83], this.map[39]||this.map[68], this.map[37]||this.map[65], velocidad);
    }

    //Se construye la torreta al pulsar T
    if(this.map[84]){
      if(this.torretaEnConstruccion==null && this.dinero>=100){
        this.torretaEnConstruccion = new Torreta();
        this.add(this.torretaEnConstruccion);
        this.modoConstruirTorreta = true;
      }
    }

    if(this.map[70])
    {
      this.jugador.alternarLinterna();
    }
  }

  //Comprobar final partida
  comprobarFinalPartida(){
    //Si el jugador esta muerto se acaba la partida
    if(this.jugador.vida<=0 || this.fabrica.vida<=0){
      this.pausa = true;
      this.finPartida = true;
      document.exitPointerLock();
      document.getElementById("tiempoFinal").textContent = Math.round(this.tiempo);
      document.getElementById("muertesFinales").textContent = this.muertesTotales;
      document.getElementById("letreroFinPartida").style.display="block";
    }
  }

  //Se aplica al coger la calavera
  eliminarTodosLosEnemigos(){
    for(var i = 0; i<this.umpalumpas.length; i++){
      this.umpalumpas[i].eliminacionInstantanea();
    }
  }

  //Creo un consumible
  crearConsumible(){
    if(this.consumible!=null){
      if(this.consumible.tipo=="corazon")this.consumible.objeto.geometry.dispose();
      this.remove(this.consumible);
    }

    var aleatorio = Math.random();
    //Hay un 20% de que salgan las calaveras, un 40% de que salga un corazon y un 40% de que salga una reparacion
    if(aleatorio<0.4){
      this.consumible = new Corazon();
      this.add(this.consumible);
    }
    else if(aleatorio<0.8){
      this.consumible = new Reparacion();
      this.add(this.consumible);
    }
    else{
      this.consumible = new Calaveras();
      this.add(this.consumible);
    }

    this.tiempoConsumible = 0;
  }

  //Comprobar colision consumible
  comprobarColisionConsumible(){
    if(!this.pausa && this.consumible.intersecta(this.jugador)){
      if(this.consumible.tipo=="corazon"){
        this.jugador.vida += 20;
        if(this.jugador.vida>100) this.jugador.vida = 100;
        this.consumible.objeto.geometry.dispose();
      }
      else if(this.consumible.tipo=="reparacion"){
        this.fabrica.vida += 100;
        if(this.fabrica.vida>500) this.fabrica.vida = 500;
      }
      else{
        this.eliminarTodosLosEnemigos();
      }

      this.remove(this.consumible);
      this.consumible = null;
      this.tiempoConsumible=0;
    }
  }

  instanciarProyectil(origen,destino,robot, color)
  {
      
      this.proyectiles.push(new Proyectil(origen,destino,robot, color));
      this.add(this.proyectiles[this.proyectiles.length-1]);

  }

  actualizarProyectiles()
  {
    for(var i = 0; i < this.proyectiles.length;i++)
    {
      this.proyectiles[i].update();
      
      this.proyectiles[i].intersecta();

      if(this.proyectiles[i].distanciaRecorrida > 70.0 || this.proyectiles[i].position.y<-2)
      {
        this.proyectiles[i].objeto.geometry.dispose();
        this.remove(this.proyectiles[i]);
        this.proyectiles.splice(i,1);
      }
    }
  }

  actualizarTorretas(){

    //Si puede construir torreta lo indico
    if(this.dinero>=100){
      document.getElementById("torreta").style.display = "inline-block";
    }
    else{
      document.getElementById("torreta").style.display = "none";
    }

    //Si estoy en modo construir torreta muestro la posicion que tendría
    if(this.modoConstruirTorreta){
      document.getElementById("torreta").textContent = "Click izquierdo para construir";
      var raycaster = new THREE.Raycaster ();
      raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera) ;
      var colision = raycaster.intersectObject(this.ground,true);

      if(colision.length>0){
        var posicion = colision[0].point;
        this.torretaEnConstruccion.update(null,this,new THREE.Vector3(posicion.x,1,posicion.z));
      }
    }

    //Actualizar todas las torretas
    for(var j = 0; j<this.torretas.length; j++){
      this.torretas[j].update(this.umpalumpas,this);
      //Si lleva viva 60s se elimina
      if(this.torretas[j].tiempoViva>=60){
        this.remove(this.torretas[j]);
        this.torretas.splice(j,1);
      }
    }
  }

  actualizarDiaNoche()
  {

    if(!this.noche) // si es de día
    {
      this.setLightIntensity(this.spotLight.intensity - 0.1 * this.clock.getDelta());

      if(this.spotLight.intensity <= 0)
      {
        this.noche = true;
      }
    }
    else
    {
      this.setLightIntensity(this.spotLight.intensity + 0.2 * this.clock.getDelta());

      if(this.spotLight.intensity >= 1)
      {
        this.noche = false;
      }
    }
  }

  update () {
    //Comprobamos si se encuentra en pausa
    this.comprobarPausa();

    if (this.stats) this.stats.update();

    // Se actualiza el jugador
    this.jugador.update(this.pausa);

    //Actualizo a todos los enemigos
    this.actualizarEnemigos();
  
    //Se comprueba si se ha acabado la partida
    this.comprobarFinalPartida();

    //Se actualiza la barra de vida del jugador y la fabrica
    this.actualizarBarrasDeVida();

    //Se ejecuta el movimiento
    this.aplicarControles();

    //Se actualiza el ciclo día noche (aumenta y disminuye la intensidad de la luz focal de la escena)
    this.actualizarDiaNoche();

    //Compruebo si hay que crear un consumible y en caso afirmativo lo creo
    if(this.tiempoConsumible>=15)
    this.crearConsumible();

    //Compruebo si hay colision con un consumible
    if(this.consumible!=null){
      this.consumible.update();
      this.comprobarColisionConsumible();
    }

    //Actualizo las torretas
    this.actualizarTorretas();

    //Actualiza los proyectiles
    if(!this.pausa)
      this.actualizarProyectiles();

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());

    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    if(!this.finPartida){
      requestAnimationFrame(() => this.update())
    }
  }
}

/// La función   main
$(function () {
  
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());

  //Gestionar el movimiento con las teclas (izquierda, arriba, derecha, abajo) (w,a,s,d) (espacio) (shift) (t) (f)
  var map = {37: false, 38: false, 39: false, 40: false, 87: false, 65: false, 83: false, 68:false, 32:false, 16:false, 84:false, 70:false};

  //Eventos de pulsacion de teclas
  window.addEventListener("keydown", function (e) {
    if (e.keyCode in map) {
        map[e.keyCode] = true;
        scene.map= map;
    }
  });

  window.addEventListener("keyup", function (e) {
    if (e.keyCode in map) {
      map[e.keyCode] = false;
      scene.map = map;
    }
  });

  //Deteccion click Iniciar partida
  document.getElementById("letreroInicio").addEventListener("click", function(e){
    document.getElementById("letreroInicio").style.display="none";
    document.body.requestPointerLock();
  });

  //Deteccion click reanudar o reiniciar partida
  document.getElementById("letreroPausa").addEventListener("click", function(e){
    document.body.requestPointerLock();
  });

  document.getElementById("letreroFinPartida").addEventListener("click", function(e){
    location.reload();
  });

  //Deteccion giro de camara
  window.addEventListener("mousemove", function(e){
    if(document.pointerLockElement==document.body){
      scene.jugador.girarCamara(e.movementX,e.movementY);
    }
  });

  //Deteccion disparo
  window.addEventListener("click", function(event){
    if(document.pointerLockElement==document.body && !scene.pausa){
      //Si esta en modo construir torreta la construye
      if(scene.modoConstruirTorreta){
        scene.torretaEnConstruccion.fijarTorreta();
        scene.torretas.push(scene.torretaEnConstruccion);
        scene.remove(scene.torretaEnConstruccion);
        scene.add(scene.torretas[scene.torretas.length-1]);
        scene.dinero -= 100;
        document.getElementById("dinero").textContent = scene.dinero+" $";
        scene.torretaEnConstruccion = null;
        scene.modoConstruirTorreta = false;
        document.getElementById("torreta").textContent = "Para construir una torreta por 100$ pulsa T";
      }
      //En caso contrario dispara
      else{
      //Se inicia el efectoDisparo
      scene.jugador.disparo();

      // Se obtiene la posición del clic
      // en coordenadas de dispositivo normalizado
      // − La esquina inferior izquierda tiene la coordenada (−1,−1) // − La esquina superior derecha tiene la coordenada (1,1) 
      var mouse = new THREE.Vector2 ();
      mouse.x = 0; 
      mouse.y = 0;

      //Se construye un rayo que parte de la cámara ( el ojo del 
      // y que pasa por la posición donde se ha hecho clic
      var raycaster = new THREE.Raycaster ();
      raycaster.setFromCamera(mouse, scene.camera) ;

      scene.instanciarProyectil(raycaster.ray.origin,raycaster.ray.direction,scene.umpalumpas, 0xCF0000);
      }
    }
  });

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
