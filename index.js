const glob = require('glob');
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({
    explicitArray: false
});

async function main() {
    try {
        const files = glob.sync( './**/*.csproj', {});
        let dotnetDependencies = [];
        const numberOfFiles = files.length;
        for(let loopVar = 0; loopVar < numberOfFiles; loopVar++) {
            const file = files[loopVar];
            const xml = fs.readFileSync(file, 'utf8');
            const jsonFromXml = await parser.parseStringPromise(xml);
            if(jsonFromXml.Project.ItemGroup) {
                if(Array.isArray(jsonFromXml.Project.ItemGroup)) {
                    jsonFromXml.Project.ItemGroup.forEach(itemGroup => {
                        if(itemGroup.PackageReference) {
                            if(Array.isArray(itemGroup.PackageReference)) {
                                itemGroup.PackageReference.forEach(packageReference => {
                                    dotnetDependencies.push({
                                        name: packageReference.$.Include,
                                        version: packageReference.$.Version
                                    });
                                });
                            } else {
                                dotnetDependencies.push({
                                    name: itemGroup.PackageReference.$.Include,
                                    version: itemGroup.PackageReference.$.Version
                                });
                            }
                        }
                    });
                } else {
                    if(jsonFromXml.Project.ItemGroup.PackageReference) {
                        if(Array.isArray(jsonFromXml.Project.ItemGroup.PackageReference)) {
                            jsonFromXml.Project.ItemGroup.PackageReference.forEach(packageReference => {
                                dotnetDependencies.push({
                                    name: packageReference.$.Include,
                                    version: packageReference.$.Version
                                });
                            });
                        } else {
                            dotnetDependencies.push({
                                name: jsonFromXml.Project.ItemGroup.PackageReference.$.Include,
                                version: jsonFromXml.Project.ItemGroup.PackageReference.$.Version
                            });
                        }
                    }
                }
                
            }
        }
        
        // get unique dotnet dependencies
        const uniqueDotnetDependencies = dotnetDependencies.filter((item, pos) => {
            return dotnetDependencies.indexOf(item) == pos;
        });
        console.log('uniqueDotnetDependencies : ', uniqueDotnetDependencies);
    } catch (error) {
        console.log(error);
    }
}

main();