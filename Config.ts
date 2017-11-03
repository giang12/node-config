import {Provider} from 'nconf';
import {isNil, defaults, merge} from 'lodash';

export class Config extends Provider{
    /**
     * Get a configuration value
	 * This will return the specified property value, throwing an exception if the
	 * configuration isn't defined.  It is used to assure configurations are defined
	 * before being used, and to prevent typos.
     * @param {string} key [string with : separator for nested objects]
     */
    public get(key:string){

    	let val = super.get(key)

    	if(isNil(val)) throw new Error(`Config key '${key}' is undefined`)

    	return val;
    }

    /**
     * Test that a configuration parameter exists
     * @param {string} key [string with : separator for nested objects]
     */
    public has(key:string): boolean{

    	return !isNil(super.get(key));
    }
}
