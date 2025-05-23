import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'
import Hypercore from 'hypercore'
import Hyperbee from 'hyperbee'
import path from 'path'


const swarm = new Hyperswarm()
Pear.teardown(() => swarm.destroy())
//Pear.updates(() => Pear.reload())


async function createPoll() { // creates the Poll
  const core = new Hypercore(path.join(Pear.config.storage, 'writer-storage'))
  await core.ready()

  const info = await core.info()
  console.log(info)
  console.log(`this is the core length: `, core.length)
  
  swarm.on("connection", (conn) => {
    console.log("New peer connected:", conn.remotePublicKey.toString("hex"))
    core.replicate(conn)

    conn.on('data', data => {
      const str = b4a.toString(data)
      try {
        const msg = JSON.parse(str)
        if (msg.type === 'vote') {
          console.log('Received vote:', msg)
          // Store it, count it, display it—up to you
        }
      } catch (err) {
        console.error('Invalid JSON from peer:', str)
      }
    })
  });
  
  swarm.on('update', () => {
    document.getElementById('peers-count').textContent = swarm.connections.size
  })

  document.querySelector("#homepage").classList.add("hidden");
  document.querySelector("#loading").classList.remove("hidden");

  swarm.join(core.discoveryKey)

  const coreKeyString = b4a.toString(core.key, 'hex');
  console.log(`this is the core key: `, coreKeyString)


  document.querySelector("#chat-room-topic").innerText = coreKeyString;
  document.querySelector("#loading").classList.add("hidden");

  document.querySelector("#questions").classList.remove("hidden");
  document.querySelector("#questions").classList.add("visible");

  //document.getElementById("save-answer").addEventListener("click", getInputValue);
  document.getElementById("save-answer").addEventListener("click", () => {;
  getInputValue(core)});

}


async function getInputValue(core){
  const db = new Hyperbee(core, core.key)
  console.log(core.key)

  let data = {
    question: document.getElementById("question").value,
    answers: [
      document.getElementById("ans1").value,
      document.getElementById("ans2").value,
      document.getElementById("ans3").value,
      document.getElementById("ans4").value
    ]
  };
  
  let jsonString = JSON.stringify(data);
  
  await db.put('key1', jsonString)

  const entry = await db.get('key1')
  console.log(entry) // this is an object
  console.log(typeof(entry))
  console.log(entry.value.toString())
  console.log(`this is a the question: ${data.question}`)
  console.log(`this is a the answer 1: ${data.answers[0]}`)
  console.log(`this is a the answer 2: ${data.answers[1]}`)
  console.log(`this is a the answer 3: ${data.answers[2]}`)

  console.log(`this is the core length: `, core.length)

};


document.getElementById("createPoll").addEventListener("click", createPoll);