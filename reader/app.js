import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'
import Hypercore from 'hypercore'
import Hyperbee from 'hyperbee'


const swarm = new Hyperswarm()
Pear.teardown(() => swarm.destroy())
//Pear.updates(() => Pear.reload())


async function joinPoll(e) {

  swarm.on('connection', () => console.log('peer connected'))

  console.log('joinpoll starts')
  
  const publicKeyString = document.querySelector("#join-poll-topic").value
  const publicKeyBuffer = b4a.from(publicKeyString, 'hex')

  const core = new Hypercore('./cores/reader-storage', publicKeyBuffer)

  await core.ready()

  console.log(core.length)
  console.log(core.key)
  console.log(`this is the core key: `, b4a.toString(core.key, 'hex'))

  const db = new Hyperbee(core)

  await db.ready()

  swarm.join(core.discoveryKey)

  await swarm.flush()

  await core.download()
  await core.update()

  console.log('joinpoll finished')



  document.querySelector("#homepage").classList.add("hidden");
  document.querySelector("#poll-container").classList.remove("hidden");
  document.querySelector("#poll-container").classList.add("visible");
  document.querySelector('#info-container').style.display = "none"

  document.querySelector("#loading").classList.add("hidden");
}

document.getElementById("joinPoll").addEventListener("click", (e) => {
  e.preventDefault();
  joinPoll();
});
