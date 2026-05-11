import { z } from "zod";

export class BaseDto{
    static schema = z.object({})    

    static validate(clientData){

        const result = this.schema.safeParse(clientData)

        if(result.success){
            return {error: null , value: result.data}
        }

        return {error: result.error, value: null}

    }
}