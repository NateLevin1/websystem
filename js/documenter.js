/**
 * The word processor in WebSystem.
 * Effectively a WebSystem wrapper for the CKEditor document editor.
 */
class Documenter {
    constructor(filename, path) {
        if(!path) {
            filename = "Untitled";
            path = "";
        }

        this.path = path;
        let title = "Documenter - "+filename;
        this.title = title;
        let win = new Window(260, 370, title, 37, 35,{x: 5, y: 4, topBarCreator: this.createTopBar, thisContext: this });
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;

        let contentContainer = document.createElement("div");
        contentContainer.style.height = "calc(100% - 1em)";
        contentContainer.classList.add("documenter-container");
        this.window.appendChild(contentContainer);

        let pageContainer = document.createElement("div");
        pageContainer.style.height = "calc(100% - 2em)";
        pageContainer.classList.add("documenter-editable-container");

        let page = document.createElement("div");
        page.classList.add("documenter-editable");
        pageContainer.appendChild(page);
        this.page = page;

        var content;
        if(path) {
            content = folders[path].content;
        }
        if(content) {
            page.innerHTML = content;
        }

        DecoupledEditor
        .create(page, {
            toolbar: ['heading', '|', "fontFamily", "fontSize", "fontColor", "fontBackgroundColor", "|", "bold", "italic", "underline", "strikethrough", "|", "alignment", "|", "numberedList", "bulletedList", "|", "indent", "outdent", "|", "link", "blockQuote", "insertTable", "mediaEmbed", "|", "undo", "redo"],
            placeholder: "Type here..."
        })
        .then((editor)=>{
            this.editor = editor;
            const toolbarContainer = document.createElement("div");
            toolbarContainer.style.height = "2em";
            toolbarContainer.classList.add("documenter-toolbar");
            contentContainer.appendChild(toolbarContainer);

            toolbarContainer.appendChild( editor.ui.view.toolbar.element );
            contentContainer.appendChild(pageContainer);

            this.checkIfNeedsToSave(); // once editor loaded
        })
        .catch((error)=>{
            console.error( error );
        });


        // LISTENERS
        document.addEventListener('keydown', (event)=>{
            if(this.win.focused()) {
                if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)  && event.keyCode == 83) {
                    event.preventDefault();
                    this.save();
                }
            }
        });
        this.currentSavedValue = content;
        this.needsToSave = !path;
        page.addEventListener("keyup", ()=>{
            this.checkIfNeedsToSave();
        });


        this.window.addEventListener("window-destroy", (event)=>{
            if(this.needsToSave) {
                event.preventClose = true;
                event.message = "Are you sure you want to exit? You have not saved your work."
            }
        });
    }

    createTopBar() {

        // FILE
        TopBar.addToTop("File", "file");
        
        // Export
        let exportOptions = TopBar.addToMenu("Export  ▶", "file", undefined, {clickable: false});
        TopBar.addSecondaryListenerForItem({el: exportOptions, name:"export"});

        TopBar.addToMenu("HTML (Browser/Web)", "export", ()=>{ 
            console.log(this.editor.getData());
        });

        TopBar.addToMenu("Print", "export", ()=>{
            this.print();
        });

        TopBar.addToMenu("Save", "file", this.save.bind(this));
        TopBar.addToMenu("Save As", "file", this.saveAs.bind(this));



        TopBar.addToMenu("Close Window", "file", ()=>{ this.win.close(); });
    
    
        // EDIT
        TopBar.addToTop("Edit", "edit");

        TopBar.addToMenu("Select All", "edit", ()=>{ 
            setTimeout(()=>{
                this.page.focus();
                setTimeout(()=>{ // without this it only works half the time in safari
                    this.editor.execute('selectAll'); 
                }, 2);
            }, 2);
        });
        TopBar.addLineToMenu("edit");

        TopBar.addToMenu("Bold", "edit", ()=>{ this.editor.execute('bold'); });
        TopBar.addToMenu("Italic", "edit", ()=>{ this.editor.execute('italic'); });
        TopBar.addToMenu("Underline", "edit", ()=>{ this.editor.execute('underline'); });
        TopBar.addToMenu("Strikethrough", "edit", ()=>{ this.editor.execute('strikethrough'); });
    
        TopBar.addToTop("Help", "help");
        TopBar.addToMenu("About Documenter", "help", ()=>{ 
            About.newWindow("Documenter", "An implementation of CKEditor 5 in WebSystem.", "1.0", "assets/documenter.png")
         });
    }

    save() {
        if(!this.path) {
            this.saveAs();
        } else {
            let data = this.editor.getData();
            FileSystem.updateContent(this.path, data);
            this.currentSavedValue = data;
        }
    }

    saveAs() {
        prompt("Please enter a name for the file")
        .then((name)=>{
            if(name) { // alert() returns null when cancel is pressed
                FileSystemGUI.requestDirectory()
                .then((dir)=>{
                    FileSystem.addFileAtLocation(name+".html", this.editor.getData(), "Text", dir)
                    [0].then(()=>{ // [0] to get the folders setItem as there isn't a files one (text)
                        this.path = dir+name+".html/";
                        this.currentSavedValue = this.editor.getData();
                        this.title = "Documenter - "+name+".html";
                        this.checkIfNeedsToSave();
                    });
                })
                .catch(()=>{
                    // saving canceled
                });
            }
        });
    }

    checkIfNeedsToSave() {
        if(!this.path) { // if there is not a path (standalone), it is un-savable
            this.win.setTitle(this.title + " *");
            return true;
        }
        if(this.editor.getData() != this.currentSavedValue) {
            if(!this.needsToSave) {
                this.needsToSave = true;
                this.win.setTitle(this.title + " *");
                return true;
            }
        } else if(this.needsToSave) {
            this.needsToSave = false;
            this.win.setTitle(this.title);
            return false;
        }
    }

    print() {
        if(this.needsToSave == true) {
            confirm("You have unsaved changes. Save before continuing?").then((result)=>{
                if(result) {
                    this.save();
                    this.checkIfNeedsToSave();
                    let html = this.editor.getData();
                    var iframe = document.createElement('iframe');
                    document.body.appendChild(iframe);

                    iframe.style.position = "fixed";
                    iframe.style.right = "0";
                    iframe.style.bottom = "0";
                    iframe.style.width = "0";
                    iframe.style.height = "0";
                    iframe.style.border = "0";

                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(html);
                    // set up the stylesheet so that the printed version look the same
                    iframe.contentWindow.document.write(`
                    <style>
                        body {
                            font-family: sans-serif;
                            font-size:1em;
                            -webkit-print-color-adjust: exact;
                        }
                        blockquote {
                            font-family: Georgia, serif;
                            padding-left: 2em;
                            margin-left:0;
                            border-left: 4px solid black;
                        }
                        .text-tiny {
                            font-size: 0.7em;
                        }
                        .text-small {
                            font-size: 0.9em;
                        }
                        .text-big {
                            font-size:1.5em;
                        }
                        .text-huge {
                            font-size:2em;
                        }
                    </style>
                    `)
                    iframe.contentWindow.document.close();

                    setTimeout(()=>{ // wait for everything to load
                        iframe.contentWindow.onafterprint = ()=>{
                            iframe.remove();
                        }
                        iframe.contentWindow.print();
                    }, 200);
                }
            });
        }
        
    }
}

appImagePaths["Documenter"] = "assets/documenter.png";
makeFunctions["Documenter"] = ()=>{ new Documenter; };


// The CSS Code is taken from the following CKEditor tutorial:
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/document-editor.html
GlobalStyle.addRaw(`
.documenter-container {
    /* This element is a flex container for easier rendering. */
    display: flex;
    flex-flow: column nowrap;
}`);

GlobalStyle.addRaw(`
.documenter-toolbar {
    /* Create the illusion of the toolbar floating over the editable. */
    box-shadow: 0 0 5px hsla( 0,0%,0%,.2 );

    /* Use the CKEditor CSS variables to keep the UI consistent. */
    border-bottom: 1px solid var(--ck-color-toolbar-border);
}`);

GlobalStyle.addRaw(`
.documenter-toolbar .ck-toolbar {
    border: 0;
    border-radius: 0;
}`);

GlobalStyle.addRaw(`
/* Make the editable container look like the inside of a native word processor application. */
.documenter-editable-container {
    padding: calc( 2 * var(--ck-spacing-large) );
    background: var(--ck-color-base-foreground);

    max-width:100%;

    /* Make it possible to scroll the "page" of the edited content. */
    overflow-y: scroll;

    padding-left: 1em;
}

.documenter-editable {
    max-width:100%;
}

.documenter-editable-container .ck-editor__editable {
    /* Set the dimensions of the "page". */
    width: 15.8cm;
    min-height: 21cm;

    /* Keep the "page" off the boundaries of the container. */
    padding: 1cm 2cm 2cm;

    border: 1px hsl( 0,0%,82.7% ) solid;
    border-radius: var(--ck-border-radius);
    background: white;

    /* The "page" should cast a slight shadow (3D illusion). */
    box-shadow: 0 0 5px hsla( 0,0%,0%,.1 );

    /* Center the "page". */
    margin: 0 auto;
}`);

GlobalStyle.addRaw(`
/* Make the block quoted text serif with some additional spacing. */
.document-editor .ck-content blockquote {
    font-family: Georgia, serif;
    margin-left: calc( 2 * var(--ck-spacing-large) );
    margin-right: calc( 2 * var(--ck-spacing-large) );
}`);