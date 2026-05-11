class ApiResponse {
  static ok(res, message = "Success", data = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, message = "Created successfully", data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static accepted(res, message = "Request accepted", data = null) {
    return res.status(202).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static partialContent(res, message = "Partial content", data = null, total = null) {
    return res.status(206).json({
      success: true,
      message,
      data,
      total,
    });
  }

  static movedPermanently(res, location) {
    return res.status(301).location(location).send();
  }

  static found(res, location) {
    return res.status(302).location(location).send();
  }

  static custom(res, statusCode, message = "Success", data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}

export default ApiResponse;