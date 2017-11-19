DEFECT = 0
COOPERATE = 1

BETRAYAL_GAIN = 1.8

window.requestAnimFrame =
  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  (callback) ->
    window.setTimeout(callback, 1000 / 60)


class Grid extends Array
  constructor: (width, height, generator) ->
    @width = width
    @height = height
    for x in [0...@width]
      col = []
      for y in [0...@height]
        col.push generator(x, y)
      this.push col

class Game
  constructor: (canvas) ->
    @canvas = canvas
    
    @width = 99
    @height = 99
    @keepscore = false
    @canvas.width = window.innerWidth
    @canvas.height = window.innerHeight

    $(window).on 'resize', =>
      delay =>
        @canvas.width = window.innerWidth
        @canvas.height = window.innerHeight

    @devcanvas = @canvas.cloneNode()
    @ctx = @devcanvas.getContext('2d')
    @finalctx = @canvas.getContext('2d')

    @grid = new Grid @width, @height, (x, y) ->
      cell = {}
      cell.lastlastplayer = COOPERATE
      cell.lastplayer = COOPERATE
      cell.player = COOPERATE
      cell.nextplayer = COOPERATE
      cell.score = 0
      cell

    for x in [0...@width]
      for y in [0...@height]
        cell = @grid[x][y]
        cell.adjacencies =
          [[x-1, y], [x+1, y],
           [x, y-1], [x, y+1],
           [x-1, y-1], [x-1, y+1],
           [x+1, y-1], [x+1, y+1],
           [x,y]
          ].reject((adj) =>
             adj[0] < 0 || adj[0] >= @width || adj[1] < 0 || adj[1] >= @height)
           .map (adj) =>
             @grid[adj[0]][adj[1]]

    @reset()

  play: (c1, c2) ->
    p1 = c1.player
    p2 = c2.player

    if p1 == COOPERATE && p2 == COOPERATE
      c1.score += 1
      c2.score += 1
    else if p1 == COOPERATE and p2 == DEFECT
      c2.score += BETRAYAL_GAIN
    else if p1 == DEFECT && p2 == COOPERATE
      c1.score += BETRAYAL_GAIN
    else
      # If both defect no score change
  
  renderScoreless: =>
    @ctx.fillStyle = "#f5aa44"
    @ctx.fillRect(0, 0, @canvas.width, @canvas.height)

    for x in [0...@width]
      for y in [0...@height]
        cell = @grid[x][y]
        if cell.player == DEFECT && cell.lastplayer == DEFECT
          @ctx.fillStyle = "#000000"
        else if cell.player == DEFECT && cell.lastplayer == COOPERATE
          @ctx.fillStyle = "#ff2525"
        else if cell.player == COOPERATE && cell.lastplayer == DEFECT
          @ctx.fillStyle = "#00aa44"
        else
          continue
        @ctx.fillRect(Math.floor(x/@width * @canvas.width),
                      Math.floor(y/@height * @canvas.height),
                      Math.ceil(@canvas.width/@width),
                      Math.ceil(@canvas.height/@height))


  colorFromWhite: (r, g, b, f) ->
    "rgb(#{Math.round(255-(255-r)*f)}," +
        "#{Math.round(255-(255-g)*f)}," +
        "#{Math.round(255-(255-b)*f)})"

  colorFromBlack: (r, g, b, f) ->
    "rgb(#{Math.round(r*f)}," +
        "#{Math.round(g*f)}," +
        "#{Math.round(b*f)})"
         

  renderKeepScore: =>
    for x in [0...@width]
      for y in [0...@height]
        cell = @grid[x][y]
        scoreCol = cell.score/@totalBestScore
        if cell.player == COOPERATE
          @ctx.fillStyle = @colorFromWhite(245, 170, 68, scoreCol)
        else
          @ctx.fillStyle = @colorFromBlack(255, 37, 37, scoreCol)
        @ctx.fillRect(Math.floor(x/@width * @canvas.width),
                      Math.floor(y/@height * @canvas.height),
                      Math.ceil(@canvas.width/@width),
                      Math.ceil(@canvas.height/@height))



  render: =>
    if @keepscore
      @renderKeepScore()
    else
      @renderScoreless()

    @finalctx.drawImage(@devcanvas, 0, 0)
    
  playAll: ->
    for row in @grid
      for cell in row
        for adj in cell.adjacencies
          @play(cell, adj)

  update: =>
    requestAnimFrame(@update)
    return if @paused

    @playAll()

    @totalBestScore = 255
    for row in @grid
      for cell in row
        best = cell
        alts = [cell]
        for adj in cell.adjacencies
          if adj.score > best.score
            best = adj
            alts = [best]
          else if adj.score == best.score
            alts.push(adj)

        if best.score > @totalBestScore
          @totalBestScore = best.score

        if alts.length > 1 # Need to resolve deadlocks
          cs = alts.find_all (adj) -> adj.player == COOPERATE
          ds = alts.find_all (adj) -> adj.player == DEFECT
          if ds.length > cs.length
            cell.nextplayer = DEFECT
          else if cs.length > ds.length
            cell.nextplayer = COOPERATE
          else # Can't resolve, don't change cell
            cell.nextplayer = cell.player
        else
          cell.nextplayer = best.player

    for row in @grid
      for cell in row
        if @keepscore
          if @totalBestScore > 255
            cell.score = Math.round(cell.score/@totalBestScore * 255)
        else
          cell.score = 0
        cell.lastlastplayer = cell.lastplayer
        cell.lastplayer = cell.player
        cell.player = cell.nextplayer

    @render()

  mousedown: (ev) =>
    @mousing = true
    @mousemove(ev)
    return false
  mouseup: (ev) => @mousing = false

  mousemove: (ev) =>
    return unless @mousing
    cx = ev.pageX-$('canvas').offset().left
    cy = ev.pageY-$('canvas').offset().top
    x = Math.floor(@width * (cx / @canvas.width))
    y = Math.floor(@height * (cy / @canvas.height))
    @grid[x][y].player = DEFECT
    @render()

  togglepause: (paused) =>
    @paused = if paused? then paused else !@paused
    if @paused
      $('.pause').addClass('btn-success')
    else
      $('.pause').removeClass('btn-success')

  reset: =>
    """Reset grid to full cooperation."""
    for x in [0...@width]
      for y in [0...@height]
        @grid[x][y].player = COOPERATE
    @render()

  events: ->
    $('.pause').click => @togglepause()
    $('.reset').click @reset
    $('canvas').mousedown @mousedown
    $('canvas').mouseup @mouseup
    $('canvas').mousemove @mousemove

    $('.bgain').val(BETRAYAL_GAIN)
    $('.bgain').on 'keyup mouseup', =>
      BETRAYAL_GAIN = parseFloat($('.bgain').val())

    $('.keepscore').prop('checked', @keepscore)
    $('.keepscore').on 'click', =>
      @keepscore = $('.keepscore').prop('checked')
      true

    $('.about').click =>
      @aboutpaused = true unless @paused
      @togglepause(true)
    $('#about').on 'hidden.bs.modal', =>
      @togglepause(false) if @aboutpaused
      @aboutpaused = false


game = new Game(document.getElementsByTagName('canvas')[0])
game.events()
game.update()
