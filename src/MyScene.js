
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../../libs/dat.gui.module.js'
import { TrackballControls } from '../../libs/TrackballControls.js'
import { Stats } from '../../libs/stats.module.js'

// Clases de mi proyecto
import {Robot} from './Robot.js'
import { Jugador } from './Jugador.js'
import {Fabrica} from './Fabrica.js'
import {Consumible} from './Consumible.js'
import {Corazon} from './Corazon.js'
import {Reparacion} from './Reparacion.js'
import {Calaveras} from './Calaveras.js'
import {Proyectil} from './Proyectil.js'
import {Torreta} from './Torreta.js'
import {Municion} from './Municion.js'
 
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    this.initStats();

    /*-----------CREACION-DE-ELEMENTOS-DEL-ENTORNO------------*/
    this.createLights (); // Las luces
    this.createGround (); // El suelo
    this.createEntorno(); // El entorno
    this.axis = new THREE.AxesHelper (5); //Creacion de los ejes
    this.add (this.axis);

    /*-----------ATRIBUTOS-PARA-GESTIONAR-EVENTOS-------------*/
    this.clock = new THREE.Clock(); //El reloj para gestionar los eventos relacionados con el tiempo
    this.pausa = false; //Almacena si el juego se encuentra en pausa
    this.finPartida = false; //Para indicar el fin de partida
      //Para la pulsacion de teclas (izquierda, arriba, derecha, abajo) (w,a,s,d) (t)
    this.map = {37: false, 38: false, 39: false, 40: false, 87: false, 65: false, 83: false, 68:false, 32:false, 16: false, 84:false};
    this.tiempo = 0;//Tiempo de partida
    this.muertesTotales = 0;//Almacena numero de robots eliminados
    this.dinero = 0;//Cantidad de dinero obtenida por el jugador
    this.tiempoConsumible = 0;//Tiempo que lleva el consumible actual
    this.modoConstruirTorreta = false; //Indica si se encuentra en modo construir torreta
    this.noche = false; //Indica si nos encontramos en la noche
    this.puedeDisparar = true; // Indica si el jugador tiene munición o es capaz de disparar

    /*-----------ELEMENTOS-DE-INTERACCIOn-DE-LA-ESCENA--------*/
    this.proyectiles = []; //Almacena los proyectiles que se encuentran en la escena
    this.jugador = new Jugador(); //Almacena al jugador
    this.camera = this.jugador.camera; //Se establece como camara la camara del jugador(Para primera persona)
    this.robots = [new Robot()]; //Almacena los robots
    this.fabrica = new Fabrica(); //Almacena la fabrica
    //Precarga modelos
    this.corazon = new Corazon();
    this.calaveras = new Calaveras();
    this.municion = new Municion();
    this.llave = new Reparacion();

    this.consumible = null;//Almacena el consumible que se encuentra activo
    this.torretas = [];//Almacena las torretas
    this.torretaEnConstruccion = null; //Almacena la torreta en construccion

    /*-----------AÑADE-ELEMENTOS-DE-INTERACCION---------------*/
    this.add (this.jugador);
    this.add(this.robots[0]);
    for(var i = 0; i<9; i++){
      this.robots.push(new Robot());
      this.add(this.robots[i+1]);
    }
    this.add(this.fabrica);

    document.getElementById("municion").textContent = this.jugador.municion;
  }
  
/*______________________________________________________________________________________________________________________*/
/*_______________________________________CREACION-DE-ELEMENTOS-DEL-ENTORNO______________________________________________*/
/*______________________________________________________________________________________________________________________*/

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
    var path = "./imgs/entorno/"
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
  
  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.20);
    // La añadimos a la escena
    this.add (ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight( 0xffffff);
    this.spotLight.position.set( -200, 100, 0 );
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

/*______________________________________________________________________________________________________________________*/
/*_______________________________________ELEMENTOS_DE_GESTION_DE_EVENTOS________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  //Actualiza las barras de vida de la fabrica y el jugador
  actualizarBarrasDeVida(){
    document.getElementById("vidaFabrica").style.width=this.fabrica.vida/5+"%";
    document.getElementById("porcentajeVidaF").textContent="Fabrica/"+this.fabrica.vida/5+"%";
    document.getElementById("vidaJugador").style.width=this.jugador.vida+"%";
    document.getElementById("porcentajeVidaJ").textContent="Jugador/"+this.jugador.vida+"%";
  }

  //Comprueba si nos encontramos en estado de pausa
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
      this.tiempoConsumible += dt;
      this.actualizarDiaNoche(dt);
      document.getElementById("tiempoPartida").textContent=Math.round(this.tiempo);
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

  actualizarDiaNoche(dt)
  {
    if(!this.noche) // si es de día
    {
      this.setLightIntensity(this.spotLight.intensity - 0.01 * dt);
      if(this.spotLight.intensity <= 0)
      {
        this.noche = true;
      }
    }
    else
    {
      this.setLightIntensity(this.spotLight.intensity + 0.02 * dt);
      if(this.spotLight.intensity >= 1)
      {
        this.noche = false;
      }
    }
  }

  clickIzquierdo(){
      //Si esta en modo construir torreta la construye
      if(this.modoConstruirTorreta){
        this.torretaEnConstruccion.fijarTorreta();
        this.torretas.push(this.torretaEnConstruccion);
        this.remove(this.torretaEnConstruccion);
        this.add(this.torretas[this.torretas.length-1]);
        this.dinero -= 100;
        document.getElementById("dinero").textContent = this.dinero+" $";
        this.torretaEnConstruccion = null;
        this.modoConstruirTorreta = false;
        document.getElementById("torreta").textContent = "Para construir una torreta por 100$ pulsa T";
      }
      //En caso contrario dispara
      else if(this.puedeDisparar){
        //Se inicia el efectoDisparo
        this.jugador.disparo();
        this.quitarMunicion(1);

        // Se obtiene la posición del clic
        // en coordenadas de dispositivo normalizado
        // − La esquina inferior izquierda tiene la coordenada (−1,−1) // − La esquina superior derecha tiene la coordenada (1,1) 
        var mouse = new THREE.Vector2 ();
        mouse.x = 0; 
        mouse.y = 0;

        //Se construye un rayo que parte de la cámara ( el ojo del 
        // y que pasa por la posición donde se ha hecho clic
        var raycaster = new THREE.Raycaster ();
        raycaster.setFromCamera(mouse, this.camera) ;

        this.instanciarProyectil(raycaster.ray.origin,raycaster.ray.direction,this.robots, 0xCF0000);
      }
  }

/*______________________________________________________________________________________________________________________*/
/*______________________________________________JUGADOR_________________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

//Se aplican los controles al jugador
aplicarControles(){
  var adelante = 0;
  var lateral = 0;

  //Se comprueba si esta corriendo con el shift
  var velocidad = 1;
  if(this.map[16]) 
    velocidad = 1.8;

  //Se aplican las teclas de desplazamiento
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
}

/*______________________________________________________________________________________________________________________*/
/*________________________________________________ROBOTS________________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  //Actualizo el estado de los enemigos
  actualizarEnemigos(){
    for(var i = 0; i<this.robots.length; i++){
      this.robots[i].update(this.pausa,this.jugador.position);

      //Si al robot le toca golpeary esta vivo se actualiza la vida del jugador o de la fabrica
      if(this.robots[i].puñetazo==0 && this.robots[i].vida>0 && !this.pausa){
        if(this.robots[i].objetivo[0]=='fabrica' && this.fabrica.vida>0)
          this.fabrica.vida-=this.robots[i].daño;
        else if(this.jugador.vida>0)
          this.jugador.vida-=this.robots[i].daño;
      }

      //Si hace 0.5 segundos que ha muerto se elimina y se añade nuevo enemigo
      if(this.robots[i].tiempoMuerto>0.5){
        this.remove(this.robots[i]);
        this.muertesTotales ++;
        this.dinero+=5;
        document.getElementById("muertes").textContent = this.muertesTotales;
        document.getElementById("dinero").textContent = this.dinero+" $";
        this.robots.splice(i,1);
        i--;
      }

      //Si hay menos de X robots añado uno, esa X se incrementa conforme avanza la partida
      if(this.robots.length<(5+Math.round(this.tiempo/50))){
        this.robots.push(new Robot());
        this.add(this.robots[this.robots.length-1]);
      }
    }
  }

  //Se aplica al coger la calavera
  eliminarTodosLosEnemigos(){
    for(var i = 0; i<this.robots.length; i++){

      this.robots[i].eliminacionInstantanea();

    }
  }

/*______________________________________________________________________________________________________________________*/
/*______________________________________________CONSUMIBLES_____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  //Creo un consumible
  crearConsumible(){
    if(this.consumible!=null)
      this.remove(this.consumible);

    //Hay un 10% de que salgan las calaveras, un 20% de que salga un corazon , un 20% de que salga una reparacion y 50% de Munición 
    var aleatorio = Math.random();

    if(aleatorio < 0.5 || this.jugador.municion==0) // CAJA -- MUNICIÓN
    {
      this.consumible = this.municion.nuevaPosicion();
    }
    else if(aleatorio<0.7){//CORAZON -- VIDA
      this.consumible = this.corazon.nuevaPosicion();
    }
    else if(aleatorio<0.9){ // LLAVE -- REPARACIÓN FÁBRICA
      this.consumible = this.llave.nuevaPosicion();
    }
    else{
      this.consumible = this.calaveras.nuevaPosicion(); // CALAVERAS -- MATAR A TODOS LOS ENEMIGOS INSTANTANEO
    }

    this.add(this.consumible);
    this.tiempoConsumible = 0;
  }

  //Comprobar colision consumible
  comprobarColisionConsumible(){
    //Si el consumible esta intersectando con el jugador aplica la acción propia y se elimina
    if(!this.pausa && this.consumible.intersecta(this)){
      this.remove(this.consumible);
      this.consumible = null;
    }
  }

/*______________________________________________________________________________________________________________________*/
/*______________________________________________PROYECTILES_____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  //Creo proyectil y se añade a la escena
  instanciarProyectil(origen,destino,robot, color)
  {
      this.proyectiles.push(new Proyectil(origen,destino,robot, color));
      this.add(this.proyectiles[this.proyectiles.length-1]);
  }

  //Aplico actualización sobre todos los proyectiles
  actualizarProyectiles()
  {
    for(var i = 0; i < this.proyectiles.length;i++)
    {
      this.proyectiles[i].update();

      //Si pasa por debajo del suelo o si se ha desplazado 70 unidades se elimina
      if(this.proyectiles[i].distanciaRecorrida > 70.0 || this.proyectiles[i].position.y<-2)
      {
        this.proyectiles[i].objeto.geometry.dispose();
        this.remove(this.proyectiles[i]);
        this.proyectiles.splice(i,1);
      }
    }
  }

  addMunicion()
  {
    this.jugador.municion += 50;
    document.getElementById("municion").textContent = this.jugador.municion;
    this.puedeDisparar = true;
  }

  quitarMunicion(cantidad)
  {
    if(this.jugador.municion >= cantidad)
    this.jugador.municion -= cantidad;

    document.getElementById("municion").textContent = this.jugador.municion;

    if(this.jugador.municion <= 0)
    {
      this.puedeDisparar = false;
    }
  }

/*______________________________________________________________________________________________________________________*/
/*_________________________________________________TORRETAS_____________________________________________________________*/
/*______________________________________________________________________________________________________________________*/

  actualizarTorretas(){
    //Si puede construir torreta lo indico se muestra
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
      this.torretas[j].update(this.robots,this);
      //Si lleva viva 60s se elimina
      if(this.torretas[j].tiempoViva>=60){
        this.remove(this.torretas[j]);
        this.torretas.splice(j,1);
      }
    }
  }

/*______________________________________________________________________________________________________________________*/
/*_________________________________________________ACTUALIZACION________________________________________________________*/
/*______________________________________________________________________________________________________________________*/
  update () {
    /*-------GESTIONAR-EVENTOS-------*/
    this.comprobarPausa();//Comprobamos si se encuentra en pausa
    if (this.stats) this.stats.update();
    this.comprobarFinalPartida();//Se comprueba si se ha acabado la partida
    this.actualizarBarrasDeVida();//Se actualiza la barra de vida del jugador y la fabrica

    /*-----------JUGADOR------------*/    
    this.jugador.update(this.pausa); // Se actualiza el jugador
    this.aplicarControles(); //Se aplica el movimiento

    /*-----------ROBOTS------------*/   
    this.actualizarEnemigos();//Actualizo a todos los enemigos
  
    /*----------CONSUMIBLE--------*/       
    if(this.tiempoConsumible>=15)//Compruebo si hay que crear un consumible y en caso afirmativo lo creo
      this.crearConsumible();

    if(this.consumible!=null){//Compruebo si hay colision con un consumible
      this.consumible.update();
      this.comprobarColisionConsumible();
    }

    /*-----------TORRETA---------*/   
    this.actualizarTorretas();//Actualizo las torretas

    /*---------PROYECTILES-------*/  
    //Actualiza los proyectiles
    if(!this.pausa)
      this.actualizarProyectiles();

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.camera);

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

  /*---------LISTENERS-------*/  

  //Eventos de pulsacion de teclas
  window.addEventListener("keydown", function (e) {
    if (e.keyCode in map) {
        map[e.keyCode] = true;
        scene.map= map;

        //Si es la tecla F alterno la linterna(Se detecta aparte para evitar que mantener presionada la tecla alterne muy rapido)
        if(e.keyCode==70) {
          scene.jugador.alternarLinterna();
        }
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
    //Si no se ha pulsado aun, se cambia el contenido
    if(document.getElementById("opcion").textContent=="Siguiente"){
      document.getElementById("opcion").textContent = "Click para empezar";
      document.getElementsByClassName("instruccionesI1")[0].src = "./imgs/controles.png";
      document.getElementsByClassName("instruccionesI2")[0].src = "./imgs/controles2.png";
    }
    //En caso contrario se oculta
    else{
      document.getElementById("letreroInicio").style.display="none";
      document.body.requestPointerLock();
    }
  });

  //Deteccion click reanudar partida
  document.getElementById("letreroPausa").addEventListener("click", function(e){
    document.body.requestPointerLock();
  });

  //Deteccion click reiniciar partida
  document.getElementById("letreroFinPartida").addEventListener("click", function(e){
    location.reload();
  });

  //Deteccion giro de camara
  window.addEventListener("mousemove", function(e){
    if(document.pointerLockElement==document.body){
      scene.jugador.girarCamara(e.movementX,e.movementY);
    }
  });

  //Deteccion click
  window.addEventListener("click", function(event){
    if(document.pointerLockElement==document.body && !scene.pausa && event.button==0){
      scene.clickIzquierdo();
    }
  });

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
