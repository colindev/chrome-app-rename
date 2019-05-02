(function(){

var btnChooseDir = document.querySelector("#btn-choose-dir");
btnChooseDir.addEventListener('click', function(e){

    chrome.fileSystem.chooseEntry({type:"openDirectory"}, function(entry){

        if (entry.isDirectory !== true) {
            return
        }

        window.myEntry = entry; 

        // create empty dir

        // copy file to empty dir
        entry.createReader().readEntries(function(files){
            files.forEach(function(f){
                if ( ! f.isFile) {
                    return
                }
                console.log(f);
            });
        });

    });
});

})();
