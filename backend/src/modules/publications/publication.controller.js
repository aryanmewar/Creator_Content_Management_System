import * as publicationService from './publication.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';

export const getPublications = async (req, res, next) => {
  try {
    const result = await publicationService.getPublications(req.query);
    return sendPaginated(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

export const getPublicationById = async (req, res, next) => {
  try {
    const pub = await publicationService.getPublicationById(req.params.id);
    return sendSuccess(res, { data: pub });
  } catch (error) { next(error); }
};

export const createPublication = async (req, res, next) => {
  try {
    const pub = await publicationService.createPublication(req.body, req.user._id);
    return sendSuccess(res, { message: 'Publication logged successfully.', data: pub, statusCode: 201 });
  } catch (error) { next(error); }
};

export const updatePublication = async (req, res, next) => {
  try {
    const pub = await publicationService.updatePublication(req.params.id, req.body, req.user._id);
    return sendSuccess(res, { message: 'Publication updated.', data: pub });
  } catch (error) { next(error); }
};
