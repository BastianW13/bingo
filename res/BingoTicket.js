const settings =
{
  textColor: 'rgb(200, 200, 200)',
  lineColor: 'rgb(255, 255, 255)',
  margin: 20,
  xStart: () => {return settings.margin},
  yStart: () => {return CVS_MAIN.height * 0.1 + settings.margin},
  xStep: () => {return Math.floor((CVS_MAIN.width - 2 * settings.margin)/9)},
  yStep: () => {
    return Math.floor(Math.min(
      settings.xStep(),
      (CVS_MAIN.height * 0.9 - 2 * settings.margin)/3))},
  font: () => {return settings.yStep() *  3/5 + "px serif"},
}


class BingoTicket
{
  static init()
  {
    this.numbers = new Set();
    this.rows = [new Set(), new Set(), new Set()];
    this.buffer = document.createElement('canvas');
    this.buffer.width = 9 * settings.xStep();
    this.buffer.height = 3 * settings.yStep();
    this.bufferCtx = this.buffer.getContext('2d');
  }

  static newTicket(seed = 0)
  {
    if (seed) RNG.setSeed(seed);
    else
    {
      seed = RNG.setSeed();
    }
    this.createNumbers();
    this.draw();
    this.output();
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
    let xStep = settings.xStep();
    let yStep = settings.yStep();
    this.buffer.width = 9 * xStep;
    this.buffer.height = 3 * yStep;
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    this.drawGrid(xStep, yStep);

    this.bufferCtx.save();
    this.bufferCtx.fillStyle = settings.textColor;
    this.bufferCtx.font = settings.font();
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
    this.bufferCtx.strokeStyle = settings.lineColor;
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
    CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
    CTX_MAIN.drawImage(this.buffer, settings.xStart(), settings.yStart());
  }
}


class RNG
{
  static setSeed(seed = Date.now())
	{
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
