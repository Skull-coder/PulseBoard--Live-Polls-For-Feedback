import ApiError from "../utils/api.error.js";


export const validateSchema = (DtoClass) =>{
    return (req, res, next) =>{
        try {
            const {error, value} = DtoClass.validate(req.body);

            if(error){
                const messages = error.issues.map(issue => issue.message)
                throw ApiError.badRequest(messages.join(", "))
            }

            req.body = value
            next()
        } catch (err) {
            next(err);
        }
    }
}