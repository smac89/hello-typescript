const models: Map<string, any> = createBarrels([
    'app/shared/models',
    'app/modules/subscription/shared/models'
]);

function createBarrels(list: string[]): Map<string, any> {
    return list.reduce((objMap, barrel) => {
        return objMap.set(barrel, {
            main: 'index.js',
            defaultExtension: 'js'
        });
    }, new Map<string, any>());
}

let g = new Map<string, number>([
    ["Hello", 1],
    ["World", 2]
]);

function es6MapToJSON<K, V>(map: Map<K, V>): {K: V} {
    return Array.from(map.entries()).reduce((objMap, entry) => {
        objMap[entry[0]] = (entry[1] instanceof Map ? es6MapToJSON(<any>entry[1]): entry[1]);
        return objMap;
    }, Object.create(null));
}

for (const entry of Array.from(g.entries())) {
    console.log(entry[0]);
}

console.log(es6MapToJSON(models));

let myObj = es6MapToJSON(models);

console.log(Object.assign(myObj, {
	"Hi": 1,
	"World": 2
}));

console.log(models instanceof Map);
