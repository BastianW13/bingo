class Loader
{
  static async init()
  {
    await this.createGlobals();
    await Promise.all([
      this.addJS('./res/BingoTicket.js'),
      this.addJS('./res/BingoGame.js')
    ]);
  }

  static createGlobals()
  {
    return new Promise((resolve) => {
      window.CVS_MAIN = document.getElementById('cvsMain');
      window.CTX_MAIN = CVS_MAIN.getContext('2d');
      window.MODES = ['Ticket', 'Game'];
      window.ACTIVE_MODE = MODES[1];
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
  }

  static setupWindowEvents()
  {
    window.onresize = () => {
      CVS_MAIN.width = window.innerWidth;
      CVS_MAIN.height = window.innerHeight;
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
    // General purpose buttons
    let btnChangeMode = document.getElementById('btnChangeMode');


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
}