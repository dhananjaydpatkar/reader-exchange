
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Locality } from '../entities/Locality.js';

const localityRepository = AppDataSource.getRepository(Locality);

export const getAllLocalities = async (req: Request, res: Response): Promise<void> => {
    try {
        const localities = await localityRepository.find({
            order: { name: 'ASC' }
        });
        res.json(localities);
    } catch (error) {
        console.error('Get Localities Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggleLocalityLive = async (req: Request, res: Response): Promise<void> => {
    // Ideally protected by Super Admin middleware
    const { id } = req.params;
    try {
        const locality = await localityRepository.findOneBy({ id: id as string });
        if (!locality) {
            res.status(404).json({ message: 'Locality not found' });
            return;
        }

        locality.isLive = !locality.isLive;
        await localityRepository.save(locality);

        res.json(locality);
    } catch (error) {
        console.error('Toggle Locality Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createLocality = async (req: Request, res: Response): Promise<void> => {
    // Ideally protected by Super Admin middleware
    const { name, pinCode, isLive } = req.body;

    try {
        // Validate required fields
        if (!name || !pinCode) {
            res.status(400).json({ message: 'Name and pinCode are required' });
            return;
        }

        // Check if locality with same name already exists
        const existingLocality = await localityRepository.findOneBy({ name });
        if (existingLocality) {
            res.status(400).json({ message: 'A locality with this name already exists' });
            return;
        }

        const locality = localityRepository.create({
            name,
            pinCode,
            isLive: isLive !== undefined ? isLive : false // Default to not live
        });

        await localityRepository.save(locality);
        res.status(201).json(locality);
    } catch (error) {
        console.error('Create Locality Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
