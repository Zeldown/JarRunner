const { remote } = require('electron');
const { dialog } = remote;
const { spawn } = require('child_process');
const fs = require('fs');

let file = "";
let folder = "";

onload = function() {
    for(let element of document.querySelectorAll('.dropdown')) {
        let height = element.children[element.children.length-1].offsetTop - element.offsetTop;
        element.onclick = function() {
            element.classList.toggle('dropdown-active');
            if(element.style.height === ((height + 60) + "px")) {
                element.style.height = "50px";
            }else {
                element.style.height = (height + 60) + "px";
            }
        }
    }
    for(let element of document.querySelectorAll('.dropdown-item')) {
        element.onclick = function() {
            let dropdown = element.parentElement;
            let id=0;
            for(let i=0;i<dropdown.children.length;i++) {
                if(dropdown.children[i] == element) {
                    id=i;
                }
            }
            let first = dropdown.children[0];
            let text = first.innerHTML;
            first.innerHTML = element.innerHTML;
            element.innerHTML = text;
        }
    }
}

function selectFile() {
    dialog.showOpenDialog({ 
        properties: ['openFile'],
        title: "Selectionner le jar",
        filters: [
            {
                name: 'Jar', extensions: ['jar']
            }
        ]
    }).then(result => {
        file = result.filePaths;
        document.querySelector('.file-path').innerHTML = result.filePaths;
    }).catch(error => {
        console.log(error);
    });
}

function selectFolder() {
    dialog.showOpenDialog({ 
        properties: ['openDirectory', 'openDirectory'],
        title: "Selectionner du dossier"
    }).then(result => {
        folder = result.filePaths;
        document.querySelector('.folder-path').innerHTML = result.filePaths;
    }).catch(error => {
        console.log(error);
    });
}

function run() {
    let id = parseInt(Math.random()*10000);
    let cwd = 'runs/' + id;
    if(folder !== '') {
        cwd = folder.toString();
    }
    document.querySelector('.title').innerHTML = "PalaEvent (run #" + id + ")";
    fs.mkdirSync(cwd, { recursive: true });
    if(document.querySelector('.eula').checked) {
        fs.writeFileSync(cwd + "/eula.txt", 'eula=true');
    }

    let logs = document.querySelector('.logs');
    let xms = document.querySelector('.xms').children[0].innerHTML;
    let xmx = document.querySelector('.xmx').children[0].innerHTML;
    let ls = spawn('java', ["-Xms" + xms, "-Xmx" + xmx, '-jar', file], {
        cwd: cwd
    });

    ls.stdout.on('data', (data) => {
        let e = document.createElement('p');
        e.innerHTML = data;
        if(e.innerHTML.includes('WARN')) {
            e.style.color = "#FFB949";
        }else if(e.innerHTML.includes('ERROR')) {
            e.style.color = "#FF425B";
        }else if(e.innerHTML.toLocaleLowerCase().includes('done')) {
            e.style.color = "#25FF11";
            e.style.fontWeight = "800";
        }
        logs.appendChild(e);
        logs.scrollTop = logs.scrollHeight;
    });

    ls.stderr.on('data', (data) => {
        let e = document.createElement('p');
        e.innerHTML = data;
        if(e.innerHTML.includes('WARN')) {
            e.style.color = "#FFB949";
        }else if(e.innerHTML.includes('ERROR')) {
            e.style.color = "#FF425B";
        }else if(e.innerHTML.toLocaleLowerCase().includes('done')) {
            e.style.color = "#25FF11";
            e.style.fontWeight = "800";
        }
        logs.appendChild(e);
        logs.scrollTop = logs.scrollHeight;
    });

    ls.on('close', (code) => {
        let e = document.createElement('p');
        e.innerHTML = code;
        logs.appendChild(e);
        logs.scrollTop = logs.scrollHeight;
        console.log(`child process exited with code ${code}`);
    });
}