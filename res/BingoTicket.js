const settingsTicket =
{
  textColor: 'rgb(200, 200, 200)',
  lineColor: 'rgb(255, 255, 255)',
  margin: 20,
  xStart: () => {return settingsTicket.margin},
  yStart: () => {return CVS_MAIN.height * 0.1 + settingsTicket.margin},
  xStep: () => {return Math.floor((CVS_MAIN.width - 2 * settingsTicket.margin)/9)},
  yStep: () => {
    return Math.floor(Math.min(
      settingsTicket.xStep(),
      (CVS_MAIN.height * 0.9 - 2 * settingsTicket.margin)/3))},
  font: () => {return settingsTicket.yStep() *  3/5 + "px serif"},
}


class BingoTicket
{
  static init()
  {
    this.numbers = new Set();
    this.rows = [new Set(), new Set(), new Set()];
    this.buffer = document.createElement('canvas');
    this.buffer.width = 9 * settingsTicket.xStep();
    this.buffer.height = 3 * settingsTicket.yStep();
    this.bufferCtx = this.buffer.getContext('2d');
    this.currentSeed = JSON.parse(localStorage.getItem('BingoTicket.currentSeed')) ||  null;
    if (this.currentSeed)
    {
      let inpID = document.getElementById('inpID');
      inpID.placeholder = 'ID: ' + this.currentSeed;
      this.newTicket(this.currentSeed);
    }
  }

  static newTicket(seed = 0)
  {
    if (seed) RNG.setSeed(seed);
    else seed = RNG.setSeed();
    this.currentSeed = seed;
    this.createNumbers();
    this.draw();
    return seed;
  }

  static createNumbers()
  {
    this.numbers.clear();

    this.defineRows();

    let number, min, row;
    let delta = 10;

    for (var col = 0; col < 9; col++)
    {
      min = (col === 0)? 1 : col*10;
      delta = (col === 0)? 9 : 10;
      delta = (col === 8)? 11 : delta;

      if ((this.rows[0].has(col) && (this.rows[1].has(col) || this.rows[2].has(col)))
          || (this.rows[1].has(col) && this.rows[2].has(col)))
      {
        row = this.checkRows(col);
        delta -=1;
        number = Math.floor(RNG.random() * delta) + min;
        this.numbers.add({
          number: number,
          x: col,
          y: row
        });
        min = number + 1;
        delta -= number%10;
        delta += (col === 0)? 1 : 0;
      }

      row = this.checkRows(col);
      number = Math.floor(RNG.random() * delta) + min;
      this.numbers.add({
        number: number,
        x: col,
        y: row
      })
    }
  }

  static defineRows()
  {
    let column;
    this.rows[0].clear();
    this.rows[1].clear();
    this.rows[2].clear();

    // Row 1
    for (var i = 0; i < 5; i++)
    {
      do
      {
        column = Math.floor(RNG.random() * 9);
      } while (this.rows[0].has(column));
      this.rows[0].add(column);
    }

    // Row 2
    let same = 0;
    for (var i = 0; i < 5; i++)
    {
      do
      {
        column = Math.floor(RNG.random() * 9);
      } while (this.rows[1].has(column) || (this.rows[0].has(column) && same >= 4));
      this.rows[1].add(column);
      if (this.rows[0].has(column)) same++;
    }

    // Row 3
    for (var col = 0; col < 9; col++)
    {
      if (!this.rows[0].has(col) && !this.rows[1].has(col))
      {
        this.rows[2].add(col);
      }
    }
    let remaining = 5 - this.rows[2].size;
    for (var i = 0; i < remaining; i++)
    {
      do
      {
        column = Math.floor(RNG.random() * 9);
      } while (this.rows[2].has(column) || (this.rows[0].has(column) && this.rows[1].has(column)));
      this.rows[2].add(column);
    }
  }

  static checkRows(col)
	{
		if (this.rows[0].has(col))
		{
			this.rows[0].delete(col);
			return 0;
		} else if (this.rows[1].has(col))
		{
			this.rows[1].delete(col);
			return 1;
		} else
		{
			this.rows[2].delete(col);
			return 2;
		}
	}

  static draw()
  {
    if (this.numbers.size === 0) return;
    let xStep = settingsTicket.xStep();
    let yStep = settingsTicket.yStep();
    this.buffer.width = 9 * xStep;
    this.buffer.height = 3 * yStep;
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    this.drawGrid(xStep, yStep);

    this.bufferCtx.save();
    this.bufferCtx.fillStyle = settingsTicket.textColor;
    this.bufferCtx.font = settingsTicket.font();
    this.bufferCtx.textAlign = 'center';
    this.bufferCtx.textBaseline = 'middle';
    this.numbers.forEach(number => {
      this.bufferCtx.fillText(
        number.number,
        xStep/2 + number.x * xStep,
        yStep/2 + number.y * yStep);
    })
    this.bufferCtx.restore();
  }

  static drawGrid(xStep, yStep)
  {
    this.bufferCtx.save();
    this.bufferCtx.strokeStyle = settingsTicket.lineColor;
    this.bufferCtx.beginPath();
    for (let i = 0; i < 10; i++)
    {
      this.bufferCtx.moveTo(i * xStep, 0);
      this.bufferCtx.lineTo(i * xStep, this.buffer.height);
    }
    for (let i = 0; i < 4; i++)
    {
      this.bufferCtx.moveTo(0, i * yStep);
      this.bufferCtx.lineTo(this.buffer.width, i * yStep);
    }
    this.bufferCtx.stroke();
    this.bufferCtx.restore();
  }

  static output()
  {
    CTX_MAIN.drawImage(this.buffer, settingsTicket.xStart(), settingsTicket.yStart());
  }
}


class Marker
{
  static init()
  {
    this.positions = new Set(JSON.parse(localStorage.getItem('Marker.positions')));
    this.buffer = document.createElement('canvas');
    this.bufferCtx = this.buffer.getContext('2d');
    this.initCanvas();
    this.redraw();
  }

  static clear()
  {
    this.positions.clear();
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
  }

  static initCanvas()
  {
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    this.buffer.width = 9 * settingsTicket.xStep();
    this.buffer.height = 3 * settingsTicket.yStep();
  }

  static addMarker(x, y)
  {
    let indexX = Math.floor((x - settingsTicket.xStart()) / settingsTicket.xStep());
    let indexY = Math.floor((y - settingsTicket.yStart()) / settingsTicket.yStep());
    let pos = {
      indexX: indexX,
      indexY: indexY
    };
    let obj;
    if ((obj = this.getPosition(indexX, indexY)).has)
    {
      this.positions.delete(obj.pos);
      this.redraw();
      return;
    }
    this.positions.add(pos);
    this.drawMarker(indexX, indexY);
  }

  static getPosition(indexX, indexY)
  {
    let obj = {
      has: false,
      pos: null
    };
    this.positions.forEach(pos => {
      if (pos.indexX === indexX && pos.indexY === indexY)
      {
        obj = {
          has: true,
          pos: pos,
        };
      }
    })
    return obj;
  }

  static drawMarker(indexX, indexY)
  {
    let xStep = settingsTicket.xStep();
    let yStep = settingsTicket.yStep();
    this.bufferCtx.save();
    this.bufferCtx.strokeStyle = 'white';
    this.bufferCtx.beginPath();
    this.bufferCtx.moveTo(indexX * xStep, (indexY + 1) * yStep);
    this.bufferCtx.lineTo((indexX + 1) * xStep, indexY * yStep);
    this.bufferCtx.stroke();
    this.bufferCtx.restore();
  }

  static redraw()
  {
    this.initCanvas();
    this.positions.forEach(pos => {
      this.drawMarker(pos.indexX, pos.indexY);
    });
  }

  static output()
  {
    CTX_MAIN.drawImage(this.buffer, settingsTicket.xStart(), settingsTicket.yStart());
  }
}

class RNG
{
  static setSeed(seed = Date.now())
	{
    seed %= 1000000000;
		return this.seed = seed;
	}

	static random()
	{
		if (!this.seed) this.setSeed();
		let r = 0;
		for (let i = 1; i <= 5; i++)
		{
			r += Math.sin(this.seed++) * 10;
		}
		return (r - Math.floor(r));
	}
}
