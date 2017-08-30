import BasicCollection from "basic-collection";

export default class RequestCollection extends BasicCollection {
    index = 0;

    add( request ) {
        if ( typeof request !== "function" ) {
            throw new Error( `You must provide a valid function, not ${typeof request}.` );
        }

        super.set( this.index++, request );
    }
}
