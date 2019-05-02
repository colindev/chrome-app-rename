(function(){

const bootstrap = 'rename.csv';
const errorLog = 'error.log';

var rootDir = null,
    maxSize = 3*1024*1024,
    sizeBaseStr = 'm',
    sizeBase = 1024*1024,
    inpSize = document.querySelector("#inp-size"),
    btnChooseDir = document.querySelector("#btn-choose-dir"),
    displayDir = document.querySelector("#display-dir"),
    btnRename = document.querySelector("#btn-rename"),
    displayError = createBox(document.querySelector("#display-error")),
    displayProcess = createBox(document.querySelector("#display-process"));

inpSize.addEventListener('change', function(e){
    var m = this.value.match(/^(\d+)([mk]?)b?$/i);
    if (m) {
        maxSize = parseInt(m[1], 10);
        sizeBaseStr = m[2].toLowerCase();

        switch(m[2].toLowerCase()){
            case 'm':
                sizeBase = 1024*1024;
                break;

            case 'k':
                sizeBase = 1024;
                break;

        }
        maxSize = maxSize * sizeBase;
    }
});

btnChooseDir.addEventListener('click', function(e){
    
    displayError.clear();
    displayProcess.clear();

    chrome.fileSystem.chooseEntry({type:"openDirectory"}, function(entry){
        if (!entry) {
            console.log('no entry selector', entry);
            return
        }
        if (entry.isDirectory !== true) {
            console.log('entry not a director', entry);
            return
        }
        rootDir = entry;
        displayDir.innerText = entry.fullPath;

    });
});

btnRename.addEventListener('click', function(e){
    displayError.clear();
    displayProcess.clear();
    process(rootDir);
});

function process(entry){
    if (!entry) {
        displayError.add('no entry selector');
        console.log('no entry selector', entry);
        return
    }
    if (entry.isDirectory !== true) {
        console.log('entry not a director', entry);
        return
    }

    // create empty dir
    entry.getDirectory(
        'tmp', 
        {create:true}, 
        function(tmpDir){

            displayProcess.add(`create tmp ${tmpDir.fullPath}`);

            var gw = {err: [], cnt: 0, done: 0};
            // open bootstrap
            entry.getFile(bootstrap, {}, function(bs){
                console.log(bs)

                displayProcess.add(`open ${bs.fullPath}`);

                // read bootstrap
                bs.file(function(src){
                    var buf = new FileReader();
                    buf.addEventListener("loadend", function() {

                        displayProcess.add(`read ${bs.fullPath}`);

                        // each line of csv
                        this.result.replace(/^.+$/mg, function(line){

                            gw.cnt++;
                            var conf = line.split(/,/),
                                oldName = conf[0],
                                newName = conf[1];

                            // copy and rename
                            entry.getFile(oldName, {}, function(file){

                                displayProcess.add(`copy ${oldName} to ${tmpDir.fullPath}/${newName}`);

                                file.getMetadata(function(meta){
                                    console.log(meta)
                                    if (meta.size > maxSize) {
                                        gw.err.push(`${oldName} size [${(meta.size/sizeBase).toFixed(2)}${sizeBaseStr}] over ${inpSize.value}`);
                                        gw.done++;
                                        recordError(entry, gw);
                                        return
                                    }
                                    file.copyTo(tmpDir, newName);
                                    gw.done++;
                                    recordError(entry, gw);
                                });
                                


                            }, function(e){
                                gw.err.push(`${oldName} miss`);
                                gw.done++;
                                recordError(entry, gw);
                            });

                        });

                        
                        
                    });
                    buf.readAsText(src);
                });
            }, function(e){displayError.add(`miss  ${entry.fullPath}/${bootstrap}`);});
        },
        onError
    );
}

function onError(err) {
    console.log(err.toString());
    displayError.add(err.toString());
}
function recordError(root, gw){
    console.log(gw)
    if (gw.cnt != gw.done) {
        return
    }
    
    gw.err.forEach(function(line){
        displayError.add(line);
    });
    root.getFile(errorLog, {create:true}, function(log){
        log.createWriter(function(w){
            var bb = new Blob([gw.err.join('\n')]);
            w.write(bb);
        });
    }, onError);
}
function createBox(dom){
    dom.add = function(line){this.innerText = this.innerText+'\n'+line;};
    dom.clear = function(){this.innerText = '';};

    return dom;
}

})();
