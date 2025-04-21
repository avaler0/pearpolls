import Hyperswarm from 'hyperswarm'
import b4a from 'b4a'
import Hypercore from 'hypercore'
import Hyperbee from 'hyperbee'
import path from 'path'

let currentConnection = null;


const swarm = new Hyperswarm()
Pear.teardown(() => swarm.destroy())
//Pear.updates(() => Pear.reload())


async function joinPoll(e) {
  const publicKeyString = document.querySelector("#join-poll-topic").value
  const publicKeyBuffer = b4a.from(publicKeyString, 'hex')

  const core = new Hypercore(path.join(Pear.config.storage, 'reader-storage'), publicKeyString)

  await core.ready()
  swarm.on('connection', conn => {
    currentConnection = conn
    core.replicate(conn)
  })

  const info = await core.info()
  console.log(info)

  console.log('joinpoll starts')
  console.log(core)
  
  console.log(core.length)
  console.log(core.key)
  console.log(`this is the core key: `, b4a.toString(core.key, 'hex'))

  const db = new Hyperbee(core)

  await db.ready()

  // join a topic
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


  document.getElementById("fetchData").addEventListener("click", () => {;
    fetchData(core)});
}

document.getElementById("joinPoll").addEventListener("click", (e) => {
  e.preventDefault();
  joinPoll();

});

async function fetchData(core){
  const db = new Hyperbee(core, core.key)
  const entry = await db.get('key1')

  console.log(entry) // this is an object
  const entryString = b4a.toString(entry.value) // In Hyperbee calling await db.get('key1'), the result is an object with a value property
  const parsed = JSON.parse(entryString) // Converts JSON string to object


  console.log(`this is a the question: ${parsed.question}`)
  console.log(`this is a the answer 1: ${parsed.answers[1]}`)
  console.log(`this is a the answer 2: ${parsed.answers[2]}`)
  console.log(`this is a the answer 3: ${parsed.answers[3]}`)


  // Create and add each answer as a button
  const container = document.getElementById('question-container');     


  // Create and add each answer as a button
  parsed.answers.forEach((answer, index) => { 
    const answerBtn = document.createElement('button');
    answerBtn.textContent = `Answer ${index + 1}: ${answer}`;
    answerBtn.addEventListener('click', () => {
      sendAnswer(index, answer);
    });
    container.appendChild(answerBtn);
  });
  
}

function sendAnswer(index, answerText) {
  if (!currentConnection) {
    console.error('No active connection to creator!');
    return;
  }

  const payload = {
    type: 'vote',
    answerIndex: index,
    answer: answerText,
    timestamp: Date.now()
  }

  const message = b4a.from(JSON.stringify(payload))
  currentConnection.write(message)

  console.log('Vote sent:', payload)
}