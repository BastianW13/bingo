const settingsGame =
{
  margin: 20,
  xStart: () => {return settingsGame.margin},
  yStart: () => {return CVS_MAIN.height * 0.1 + settingsGame.margin},
  xStep: () => {return Math.floor((CVS_MAIN.width - 2 * settingsGame.margin)/10)},
  yStep: () => {
    return Math.floor(Math.min(
      settingsGame.xStep(),
      (CVS_MAIN.height * 0.9 - 2 * settingsGame.margin)/10))},
  font: () => {return settingsGame.yStep() *  3/5 + "px serif"},
  fontBall: () => {return settingsGame.yStep() * 1.5 + "px serif"},
  colors: ['rgb(28,90,249)', 'rgb(212,145,173)', 'rgb(255,85,10)', 'rgb(255,243,25)', 'rgb(2,118,1)'],
}

class BingoGame
{
  static init()
  {
    this.mode = 'modeAll';
    this.direction = 'ttb';
    this.min = 1;
    this.range = 90;
    this.numbers = new Set(JSON.parse(localStorage.getItem('BingoGame.numbers')));
    this.currentNumber = JSON.parse(localStorage.getItem('BingoGame.currentNumber'));
    this.xStep = 0;
    this.yStep = 0;

    this.bufferNumbers = document.createElement('canvas');
    this.bufferNumbersCtx = this.bufferNumbers.getContext('2d');

    this.bufferBall = document.createElement('canvas');
    this.bufferBallCtx = this.bufferBall.getContext('2d');

    this.tips = new Map();

    this.initCanvas();
    this.initTips();
    this.redraw();
  }

  static initTips()
  {
    this.tips.set(1, 'One, eins, uun, een, Zakje zweet');
    this.tips.set(2, 'One little duck, quack');
    this.tips.set(3, 'One little flea, Number three');
    this.tips.set(4, 'One cute whore on the floor, number 4');
    this.tips.set(5, 'Just 5! "Just 5?" Just 5!');
    this.tips.set(6, 'Ganz allein die sechs');
    this.tips.set(7, 'Jugs to heaven');
    this.tips.set(8, 'ruja dupra dopre dupa, one fat lady number eight');
    this.tips.set(9, 'What does the german virgin say?');
    this.tips.set(10, 'Downing street number ten! Insane in the membrane.');
    this.tips.set(11, 'Legs eleven');
    this.tips.set(12, 'A dozen');
    this.tips.set(13, 'Unlucky for some..');
    this.tips.set(14, 'Deutschland ist Weltmeister! "..." Vier und zehn');
    this.tips.set(15, 'En francais? "Cuntz"');
    this.tips.set(16, 'Sweet sixteen');
    this.tips.set(17, 'Dancing queen ..');
    this.tips.set(18, 'Heute fährt die 18 bis nach Istanbul');
    this.tips.set(19, 'Last of the teenagers');
    this.tips.set(20, 'Nie im Leben kleiner Peter, "20cm", zwanzig, "schwanzig"');
    this.tips.set(21, 'Key to the door');
    this.tips.set(22, 'Two little ducks, quack quack');
    this.tips.set(23, 'A duck and a flea');
    this.tips.set(24, 'Jack Bauer');
    this.tips.set(33, 'Two little fleas');
    this.tips.set(34, 'I caught a Haifisch');
    this.tips.set(40, 'Firsich');
    this.tips.set(42, 'The answer to life, the universe and everything');
    this.tips.set(44, 'May the fours be with you! All the 4s');
    this.tips.set(45, 'Halfway house');
    this.tips.set(50, "Let's get schwifty");
    this.tips.set(51, 'Clumsy bum');
    this.tips.set(54, 'Deutschland ist Weltmeister');
    this.tips.set(55, 'All the 5s, 55');
    this.tips.set(57, 'Heinz varieties of pickles');
    this.tips.set(61, 'Oscar pistorious with a gun');
    this.tips.set(63, 'Tits McGee');
    this.tips.set(64, 'NINTENDO.., "64"');
    this.tips.set(69, 'Dinner for two with a hairy view. / Anyway you lick at it');
    this.tips.set(74, 'Deutschland ist Weltmeister');
    this.tips.set(77, 'All the 7s. / Sunset strip');
    this.tips.set(80, "Don't sleep with Caty");
    this.tips.set(88, 'Ruja dupra dopre dupa, two fat ladys');
    this.tips.set(90, 'Deutschland ist Weltmeister');
  }

  static initCanvas()
  {
    this.yStep = settingsGame.yStep();
    if (this.mode === 'modeAll')
    {
      this.xStep = settingsGame.xStep() / 2;
    } else
    {
      this.xStep = settingsGame.xStep();
    }
    this.bufferNumbers.width = 10 * this.xStep;
    this.bufferNumbers.height = 10 * this.yStep;
    this.bufferBall.width = 10 * this.xStep;
    this.bufferBall.height = 10 * this.yStep;
  }

  static switchMode()
  {
    if (this.mode === 'modeAll') this.mode = 'modeBall';
    else if (this.mode === 'modeBall') this.mode = 'modeNumbers';
    else if (this.mode === 'modeNumbers') this.mode = 'modeAll';
  }

  static switchDirection()
  {
    if (this.direction === 'ttb') this.direction = 'ltr';
    else if (this.direction === 'ltr') this.direction = 'ttb';
  }

  static restart()
  {
    this.numbers.clear();
    this.currentNumber = null;
    this.bufferNumbersCtx.clearRect(0, 0, this.bufferNumbers.width, this.bufferNumbers.height);
    this.bufferBallCtx.clearRect(0, 0, this.bufferBall.width, this.bufferBall.height);
  }

  static drawNumber()
  {
    if (this.numbers.size >= 90) return;
    let number;
    do {
      number = Math.floor(Math.random() * this.range) + this.min;
    } while (this.numbers.has(number));
    this.numbers.add(number);
    this.currentNumber = number;
    this.outputNumber(number);
  }

  static outputNumber(number)
  {
    let color = settingsGame.colors[Math.floor((number-1)/20)];
    //Adding to list of numbers
    this.bufferNumbersCtx.save();
    this.bufferNumbersCtx.font = settingsGame.font();
    this.bufferNumbersCtx.textBaseline = 'top';
    this.bufferNumbersCtx.fillStyle = color;
    if (this.direction === 'ttb')
    {
      this.bufferNumbersCtx.fillText(number, Math.floor((number-1)/10) * this.xStep, (number-1)%10 * this.yStep);
    } else if (this.direction === 'ltr')
    {
      this.bufferNumbersCtx.fillText(number, (number-1)%10 * this.xStep, Math.floor((number-1)/10) * this.yStep);
    }
    this.bufferNumbersCtx.restore();

    //Showing as current number
    this.bufferBallCtx.save();
    this.bufferBallCtx.clearRect(0, 0, this.bufferBall.width, this.bufferBall.height);
    this.drawBall(color);
    this.bufferBallCtx.font = settingsGame.fontBall();
    this.bufferBallCtx.textBaseline = 'middle';
    this.bufferBallCtx.textAlign = 'center';
    this.bufferBallCtx.fillStyle = 'black';
    this.bufferBallCtx.fillText(number, this.bufferBall.width/2, this.bufferBall.height/4);
    this.bufferBallCtx.restore();

    //Showing tips
    if (this.tips.has(number))
    {
      this.showTip(number);
    }
  }

  static drawBall(color)
  {
    this.bufferBallCtx.save();
    let radius = this.bufferBall.height/4;
    let gradient = this.bufferBallCtx.createRadialGradient(
      this.bufferBall.width/2, this.bufferBall.height/4, 0,
      this.bufferBall.width/2, this.bufferBall.height/4, radius
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, color);

    this.bufferBallCtx.fillStyle = gradient;
    this.bufferBallCtx.beginPath();
    this.bufferBallCtx.arc(this.bufferBall.width/2, this.bufferBall.height/4, radius, 0, 2*Math.PI);
    this.bufferBallCtx.fill();
    this.bufferBallCtx.restore();
  }

  static showTip(number)
  {
    this.bufferBallCtx.save();
    let text = this.tips.get(number);
    this.bufferBallCtx.fillStyle = 'white';
    this.bufferBallCtx.font = settingsGame.font();
    this.bufferBallCtx.textBaseline = 'bottom';
    this.bufferBallCtx.textAlign = 'center';
    this.bufferBallCtx.fillText(text, this.bufferBall.width/2, this.bufferBall.height * 3/4, this.bufferBall.width);
    this.bufferBallCtx.restore();
  }

  static redraw()
  {
    this.initCanvas();

    // List of numbers
    this.bufferNumbersCtx.save();
    this.bufferNumbersCtx.font = settingsGame.font();
    this.bufferNumbersCtx.textBaseline = 'top';
    let color;
    this.numbers.forEach((number, index) => {
      color = settingsGame.colors[Math.floor((number-1)/20)];
      this.bufferNumbersCtx.fillStyle = color;
      if (this.direction === 'ttb')
      {
        this.bufferNumbersCtx.fillText(number, Math.floor((number-1)/10) * this.xStep, (number-1)%10 * this.yStep);
      } else if (this.direction === 'ltr')
      {
        this.bufferNumbersCtx.fillText(number, (number-1)%10 * this.xStep, Math.floor((number-1)/10) * this.yStep);
      }
    });
    this.bufferNumbersCtx.restore();

    // Current number
    if (!this.currentNumber) return;
    color = color = settingsGame.colors[Math.floor((this.currentNumber-1)/20)];
    this.bufferBallCtx.save();
    this.bufferBallCtx.clearRect(0, 0, this.bufferBall.width, this.bufferBall.height);
    this.drawBall(color);
    this.bufferBallCtx.font = settingsGame.fontBall();
    this.bufferBallCtx.textBaseline = 'middle';
    this.bufferBallCtx.textAlign = 'center';
    this.bufferBallCtx.fillStyle = 'black';
    this.bufferBallCtx.fillText(this.currentNumber, this.bufferBall.width/2, this.bufferBall.height/4);
    this.bufferBallCtx.restore();
    if (this.tips.has(this.currentNumber))
    {
      this.showTip(this.currentNumber);
    }
  }

  static output()
  {
    CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
    let xStart = settingsGame.xStart();
    let yStart = settingsGame.yStart();

    if (this.mode === 'modeAll')
    {
      CTX_MAIN.drawImage(this.bufferNumbers, xStart, yStart);
      CTX_MAIN.drawImage(this.bufferBall, CVS_MAIN.width/2, yStart);
    } else if (this.mode === 'modeBall')
    {
      CTX_MAIN.drawImage(this.bufferBall, xStart, yStart);
    } else if (this.mode === 'modeNumbers')
    {
      CTX_MAIN.drawImage(this.bufferNumbers, xStart, yStart);
    }
  }
}
