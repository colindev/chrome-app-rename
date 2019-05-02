(function(){

const bootstrap = 'rename.csv';

var btnChooseDir = document.querySelector("#btn-choose-dir");
btnChooseDir.addEventListener('click', function(e){

    chrome.fileSystem.chooseEntry({type:"openDirectory"}, function(entry){

        if (!entry) {
            console.log('no entry selector', entry);
            return
        }
        if (entry.isDirectory !== true) {
            console.log('entry not a director', entry);
            return
        }

        window.myEntry = entry;

        // create empty dir
        entry.getDirectory(
            'tmp', 
            {create:true}, 
            function(dir){

                // read bootstrap
                entry.getFile(bootstrap, {}, function(bs){
                    window.myBootstrap = bs;

                    bs.file(function(src){
                        var buf = new FileReader();
                        buf.addEventListener("loadend", function() {
                            console.log(buf.result);
                        });
                        buf.readAsText(src);
                    });
                }, onError);
 /*           
                // copy file to empty dir
                entry.createReader().readEntries(function(files){
                    files.forEach(function(f){
                        if ( ! f.isFile || f.name == bootstrap) {
                            return
                        }
                        console.log(f);
                        f.copyTo(dir)

                    });
                });
*/
            },
            onError
        );



    });
});

function onError(err) {
    console.log(err.toString());
}

})();
