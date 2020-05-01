class Loader
{
  static async init()
  {
    await this.createGlobals();
    await Promise.all([
      this.addJS('./res/BingoTicket.js'),
      this.addJS('./res/BingoGame.js')
    ]);
    BingoTicket.init();
    BingoGame.init();
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
      window.ACTIVE_MODE = MODES[0];
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
  }

  static setupWindowEvents()
  {
    let putLocalStorage = () => {
      localStorage.setItem('BingoGame.numbers', JSON.stringify([...BingoGame.numbers]));
      localStorage.setItem('BingoGame.currentNumber', BingoGame.currentNumber);
    }

    window.onblur = putLocalStorage;
    window.onunload = putLocalStorage;

    window.onresize = () => {
      CVS_MAIN.width = document.documentElement.clientWidth;
      CVS_MAIN.height = document.documentElement.clientHeight;
      if (ACTIVE_MODE === MODES[0])
      {
        BingoTicket.draw();
        BingoTicket.output();
      } else if (ACTIVE_MODE === MODES[1])
      {
        BingoGame.redraw();
        BingoGame.output();
      }
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
      } else
      {
        alert('Not a valid ID');
      }
    }

    btnNewGame.onclick = () => {
      BingoGame.restart();
      BingoGame.output();
    }

    btnDrawNumber.onclick = () => {
      BingoGame.drawNumber();
      BingoGame.output();
    }

    btnSwitchDirection.onclick = () => {
      BingoGame.switchDirection();
      BingoGame.redraw();
      BingoGame.output();
    }

    btnSwitchView.onclick = () => {
      BingoGame.switchMode();
      BingoGame.redraw();
      BingoGame.output();
    }

    btnChangeMode.onclick = () => {
      let cTicket = document.getElementsByClassName('cTicket');
      let cGame = document.getElementsByClassName('cGame');
      if (ACTIVE_MODE === MODES[0])
      {
        for (let i = 0; i < cTicket.length; i++)
        {
          cTicket[i].style.display = 'none';
        }
        for (let i = 0; i < cGame.length; i++)
        {
          cGame[i].style.display = 'block';
        }
        CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
        BingoGame.output();
        ACTIVE_MODE = MODES[1];
      } else if (ACTIVE_MODE === MODES[1])
      {
        for (let i = 0; i < cGame.length; i++)
        {
          cGame[i].style.display = 'none';
        }
        for (let i = 0; i < cTicket.length; i++)
        {
          cTicket[i].style.display = 'block';
        }
        CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
        BingoTicket.output();
        ACTIVE_MODE = MODES[0];
      }
    }
  }

  static setupMouseEvents()
  {
    CVS_MAIN.onclick = () => {
      if (ACTIVE_MODE === MODES[0])
      {

      } else if (ACTIVE_MODE === MODES[1])
      {
        BingoGame.drawNumber();
        BingoGame.output();
      }
    }
    CVS_MAIN.ontouch = () => {
      if (ACTIVE_MODE === MODES[0])
      {

      } else if (ACTIVE_MODE === MODES[1])
      {
        BingoGame.drawNumber();
        BingoGame.output();
      }

    }
  }
}
