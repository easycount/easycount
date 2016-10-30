
function abrirArchivo(name, callbackBueno, callbackMalo)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function (){
        if (xhttp.readyState == 4){
            var objetoData = parsear(xhttp.responseText);

            callbackBueno(objetoData);
        }
        else if(xhttp.status == 404 || xhttp.status == 500)
        {
            callbackMalo(xhttp.statusText);
        }
    };
    xhttp.open("GET", name, true);
    xhttp.send(null);
}

function parsear(text)
{
    vertexArray = [ ];
    normalArray = [ ];
    textureArray = [ ];
    indexArray = [ ];

    var vertex = [ ];
    var normal = [ ];
    var texture = [ ];
    var facemap = { };
    var index = 0;

    var lines = text.split("\n");
    for (var lineIndex in lines) {
        var line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");

        // para ignorar comentarios
        if (line[0] == "#")
            continue;

        var array = line.split(" ");
        if (array[0] == "v") {
            // coordenadas posicion vertices
            vertex.push(parseFloat(array[1]));
            vertex.push(parseFloat(array[2]));
            vertex.push(parseFloat(array[3]));
        }
        else if (array[0] == "vt") {
            // coordenadas posicion texturas
            texture.push(parseFloat(array[1]));
            texture.push(parseFloat(array[2]));
        }
        else if (array[0] == "vn") {
            // coordenadas vectores normales
            normal.push(parseFloat(array[1]));
            normal.push(parseFloat(array[2]));
            normal.push(parseFloat(array[3]));
        }
        else if (array[0] == "f") {
            // face
            if (array.length != 4) {
                continue;
            }

            for (var i = 1; i < 4; ++i) {
                if (!(array[i] in facemap)) {
                    // anyadimos una nueva entrada al mapa y al array
                    var f = array[i].split("/");
                    var vtx, nor, tex;

                    if (f.length == 1) {
                        vtx = parseInt(f[0]) - 1;
                        nor = vtx;
                        tex = vtx;
                    }
                    else if (f.length = 3) {
                        vtx = parseInt(f[0]) - 1;
                        tex = parseInt(f[1]) - 1;
                        nor = parseInt(f[2]) - 1;
                    }
                    else {
                        return null;
                    }

                    // completamos el array de vertices
                    var x = 0;
                    var y = 0;
                    var z = 0;
                    if (vtx * 3 + 2 < vertex.length) {
                        x = vertex[vtx*3];
                        y = vertex[vtx*3+1];
                        z = vertex[vtx*3+2];
                    }
                    vertexArray.push(x);
                    vertexArray.push(y);
                    vertexArray.push(z);

                    // completamos el array de texturas
                    x = 0;
                    y = 0;
                    if (tex * 2 + 1 < texture.length) {
                        x = texture[tex*2];
                        y = texture[tex*2+1];
                    }
                    textureArray.push(x);
                    textureArray.push(y);

                    // completamos el array de normales
                    x = 0;
                    y = 0;
                    z = 1;
                    if (nor * 3 + 2 < normal.length) {
                        x = normal[nor*3];
                        y = normal[nor*3+1];
                        z = normal[nor*3+2];
                    }
                    normalArray.push(x);
                    normalArray.push(y);
                    normalArray.push(z);

                    facemap[array[i]] = index++;
                }

                indexArray.push(facemap[array[i]]);
            }
        }
    }

    result = {};
    result["vertexPositions"] = vertexArray;
    result["vertexNormals"] = normalArray;
    result["vertexTextureCoords"] = textureArray;
    result["indices"] = indexArray;

    if(result["vertexPositions"] == "")
        document.write("ERROR: No se ha podido leer el archivo o está vacio.<br> <br>NO USAR CHROME");
    else
        //document.write(JSON.stringify(result));

    return result
}