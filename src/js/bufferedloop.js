// thx to @LoveEevee for this - https://github.com/LoveEevee

class BufferedLoop{
	constructor(bgm1,bgm2){
		this.context=new AudioContext()
		this.buffers=[]
		this.sources=new Set()
		this.bufferedTime=0
		this.iteration=0
		this.bgm1=bgm1
		this.bgm2=bgm2
		this.loadSound(bgm1.url,0)
		this.loadSound(bgm2.url,1)
	}
	loadSound(url,number){
		var self=this
		var request=new XMLHttpRequest()
		request.open("GET",url)
		request.responseType="arraybuffer"
		request.onload=function(){
			self.context.decodeAudioData(request.response,function(buffer){
				self.buffers[number]=buffer
				self.setLoaded()
			})
		}
		request.send()
	}
	setLoaded(){
		if(this.buffers[0]&&this.buffers[1]){
			this.loaded=true
			if(this.loadCallback){
				this.loadCallback()
				delete this.loadCallback
			}
		}
	}
	playSound(buffer,time,duration){
		var self=this
		var source=this.context.createBufferSource()
		source.buffer=buffer
		source.connect(this.context.destination)
		source.start(time)
		this.bufferedTime=time+duration
		this.sources.add(source)
		setTimeout(function(){
			self.sources.delete(source)
		},duration*1000)
	}
	addLoop(){
		if(this.context.currentTime>this.bufferedTime-1){
			this.playSound(
				this.buffers[1],
				this.start+this.bgm1.duration+this.bgm2.duration*this.iteration,
				this.bgm2.duration
			)
			this.iteration++
		}
	}
	play(){
		var self=this
		if(!this.loaded){
			this.loadCallback=this.play
			return
		}
		this.start=this.context.currentTime+0.1
		this.playSound(
			this.buffers[0],
			this.start,
			this.bgm1.duration
		)
		self.addLoop()
		self.interval=setInterval(function(){
			self.addLoop()
		},100)
	}
	pause(){
		clearInterval(this.interval)
		this.sources.forEach(function(source){
			source.stop(0)
		})
	}
}