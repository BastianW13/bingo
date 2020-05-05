class Loader
{
  static async init()
  {
    console.log('Latest branch: marker-toggle');
    await this.createGlobals();
    await Promise.all([
      this.addJS('./res/BingoTicket.js'),
      this.addJS('./res/BingoGame.js')
    ]);
    BingoTicket.init();
    BingoGame.init();
    Marker.init();
    OUTPUT = () => {
      CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
      if (ACTIVE_MODE === MODES[0])
      {
        BingoTicket.output();
        Marker.output();
      } else if (ACTIVE_MODE === MODES[1])
      {
        BingoGame.output();
      }
    }
  }

  static createGlobals()
  {
    return new Promise((resolve) => {
      window.CVS_MAIN = document.getElementById('cvsMain');
      window.CTX_MAIN = CVS_MAIN.getContext('2d');
      CVS_MAIN.style.width = document.documentElement.clientWidth;
      CVS_MAIN.style.height = document.documentElement.clientHeight;
      CVS_MAIN.width = document.documentElement.clientWidth;
      CVS_MAIN.height = document.documentElement.clientHeight;
      window.MODES = ['Ticket', 'Game'];
      window.ACTIVE_MODE = localStorage.getItem('ACTIVE_MODE') || MODES[0];
      window.OUTPUT = () => {};
      resolve();
    })
  }

  static addJS(src, type = "text/javascript")
  {
    return new Promise((resolve) => {
      let script = document.createElement('script');
      script.src = src;
      script.type = type;
      script.onload = () => {
        resolve();
      }
      document.getElementsByTagName('head')[0].appendChild(script);
    })
  }

  static setup()
  {
    this.setupWindowEvents();
    this.setupButtonEvents();
    this.setupMouseEvents();
    this.activateButtons();
    OUTPUT();
  }

  static setupWindowEvents()
  {
    let putLocalStorage = () => {
      localStorage.setItem('BingoGame.numbers', JSON.stringify([...BingoGame.numbers]));
      localStorage.setItem('BingoGame.currentNumber', BingoGame.currentNumber);
      localStorage.setItem('BingoTicket.currentSeed', BingoTicket.currentSeed);
      localStorage.setItem('Marker.positions', JSON.stringify([...Marker.positions]));
      localStorage.setItem('ACTIVE_MODE', ACTIVE_MODE);
      localStorage.setItem('BingoGame.mode', BingoGame.mode);
      localStorage.setItem('BingoGame.direction', BingoGame.direction);
    }

    window.onblur = putLocalStorage;
    window.onunload = putLocalStorage;

    window.onresize = () => {
      CVS_MAIN.width = document.documentElement.clientWidth;
      CVS_MAIN.height = document.documentElement.clientHeight;
      BingoTicket.draw();
      Marker.redraw();
      BingoGame.redraw();
      OUTPUT();
    }
  }

  static setupButtonEvents()
  {
    // Ticket control
    let btnNewTicket = document.getElementById('btnNewTicket');
    let btnClearMarker = document.getElementById('btnClearMarker');
    // Game control
    let btnNewGame = document.getElementById('btnNewGame');
    let btnDrawNumber = document.getElementById('btnDrawNumber');
    let btnSwitchDirection = document.getElementById('btnSwitchDirection');
    let btnSwitchView = document.getElementById('btnSwitchView');
    // General purpose
    let btnChangeMode = document.getElementById('btnChangeMode');
    let inpID = document.getElementById('inpID');

    btnNewTicket.onclick = () => {
      if (inpID.checkValidity())
      {
        let id = BingoTicket.newTicket(inpID.value || null);
        inpID.placeholder = "ID: " + id;
        Marker.clear();
        Marker.redraw();
        OUTPUT();
      } else
      {
        alert('Not a valid ID');
      }
    }

    btnClearMarker.onclick = () => {
      Marker.clear();
      Marker.redraw();
      OUTPUT();
    }

    btnNewGame.onclick = () => {
      BingoGame.restart();
      OUTPUT();
    }

    btnDrawNumber.onclick = () => {
      BingoGame.drawNumber();
      OUTPUT();
    }

    btnSwitchDirection.onclick = () => {
      BingoGame.switchDirection();
      BingoGame.redraw();
      OUTPUT();
    }

    btnSwitchView.onclick = () => {
      BingoGame.switchMode();
      BingoGame.redraw();
      OUTPUT();
    }

    btnChangeMode.onclick = () => {
      let cTicket = document.getElementsByClassName('cTicket');
      let cGame = document.getElementsByClassName('cGame');
      if (ACTIVE_MODE === MODES[0])
      {
        ACTIVE_MODE = MODES[1];
        this.activateButtons();
      } else if (ACTIVE_MODE === MODES[1])
      {
        ACTIVE_MODE = MODES[0];
        this.activateButtons();
      }
      OUTPUT();
    }

    inpID.onkeyup = (ev) => {
      if (ev.code === 'Enter' || ev.keyCode === 13)
      {
        ev.preventDefault();
        if (inpID.checkValidity())
        {
          let id = BingoTicket.newTicket(inpID.value || null);
          inpID.placeholder = "ID: " + id;
          Marker.clear();
          Marker.redraw();
          OUTPUT();
        } else
        {
          alert('Not a valid ID');
        }
      }
    }
  }

  static setupMouseEvents()
  {
    CVS_MAIN.onclick = (ev) => {
      let x = ev.clientX;
      let y = ev.clientY;
      if (ACTIVE_MODE === MODES[0] && BingoTicket.currentSeed)
      {
        Marker.addMarker(x, y);
      } else if (ACTIVE_MODE === MODES[1] && BingoGame.isHit(x, y))
      {
        BingoGame.drawNumber();
      }
      OUTPUT()
    }
    CVS_MAIN.ontouch = () => {
      // Mobile seems to support onclick, so for now this will not be implementet seperately
    }
  }

  static activateButtons()
  {
    let cTicket = document.getElementsByClassName('cTicket');
    let cGame = document.getElementsByClassName('cGame');
    document.getElementById('btnChangeMode').style.display = 'block';
    if (ACTIVE_MODE === MODES[0])
    {
      for (let i = 0; i < cTicket.length; i++)
      {
        cTicket[i].style.display = 'block';
      }
      for (let i = 0; i < cGame.length; i++)
      {
        cGame[i].style.display = 'none';
      }
    } else if (ACTIVE_MODE === MODES[1])
    {
      for (let i = 0; i < cGame.length; i++)
      {
        cGame[i].style.display = 'block';
      }
      for (let i = 0; i < cTicket.length; i++)
      {
        cTicket[i].style.display = 'none';
      }
    }
  }
}
