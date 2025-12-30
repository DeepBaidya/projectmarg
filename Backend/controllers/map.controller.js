import { asyncHandler } from "../utils/asyncHandler.js"
import { City } from "../models/city.model.js"
import { Road } from "../models/road.model.js";
import getDistanceToRoad from '../utils/rader.js'

const mapGet = asyncHandler(async (req, res) => {
    const { centerLocation } = req.body;

    console.log(centerLocation)

    const lat = centerLocation[0];
    const lng = centerLocation[1];

    if (!lng || !lat) {
        return res.status(411).json({
            message: "send coordinate",
            success: false
        })
    }


    const cities = await City.find({
        centerCoordinates: {
            $geoWithin: {
                $centerSphere: [
                    [parseFloat(lng), parseFloat(lat)],
                    10 / 6378.1 // 5km radius
                ]
            }
        }
    }).populate({
        path: "roads"
    })



    if (cities.length == 0) {
        return res.status(412).json({
            message: "no city",
            success: false
        })
    }


    const roads = cities.flatMap(city => city.roads)


    return res.status(210).json({
        roads,
        message: 'get sucessfully',
        success: true
    })

})

//.........................................................

const setRoadCondition = asyncHandler(async (req, res) => {
    const { centerLocation } = req.body;
    const file = req.file;

    console.log(centerLocation)

    // 1. Validation
    if (!centerLocation || !file) {
        return res.status(400).json({ message: "Location and file are required", success: false });
    }

    const [lng, lat] = centerLocation.split(',').map(num => parseFloat(num.trim()));
    const userPoint = [lng, lat];
    const roadWidthMeters = 50; 

    console.log("here")

    // 2. Initial filter: Find cities within 5km of the user
    const cities = await City.find({
        centerCoordinates: {
            $geoWithin: {
                $centerSphere: [
                    [parseFloat(lng), parseFloat(lat)],
                    10 / 6378.1 // 5km radius
                ]
            }
        }
    }).populate({
        path: "roads"
    })


    if (cities.length === 0) {
        return res.status(404).json({ message: "No cities found in this area", success: false });
    }

    // 3. Find IDs of roads where the user is inside the rectangle buffer
    const matchedRoadIds = [];
    const allRoads = cities.flatMap(city => city.roads);

    for (const road of allRoads) {
        // Accessing your model's coordinates: [[lng, lat], [lng, lat]]
        if (road.coordinates && road.coordinates.length >= 2) {
            const p1 = road.coordinates[0];
            const p2 = road.coordinates[1];

            if (isInsideRoadBuffer(userPoint, p1, p2, roadWidthMeters)) {
                matchedRoadIds.push(road._id);
            }
        }
    }

    // 4. Update the condition for found roads and send response
    if (matchedRoadIds.length > 0) {

        let roadData = 50;

        if(file.category === 'IMAGE'){
            roadData=10
        }
        if(file.category === 'VIDEO'){
            roadData=70
        }

        // Update all matched roads in one database call
        await Road.updateMany(
            { _id: { $in: matchedRoadIds } },
            { $set: { condition: roadData } }
        );

        return res.status(200).json({
            success: true,
            message: `Successfully updated condition for ${matchedRoadIds.length} road(s)`,
            updatedRoadIds: matchedRoadIds
        });
    } else {
        return res.status(404).json({
            success: false,
            message: "User is not on any known road segment"
        });
    }
});

/**
 * Helper: Rectangle Buffer Intersection Logic
 */
function isInsideRoadBuffer(point, p1, p2, r) {
    const [px, py] = point;
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return false;

    // Meters to Degrees conversion (adjusted for latitude)
    const rDeg = r / (111320 * Math.cos(y1 * Math.PI / 180));

    // Normal unit vector (Perpendicular)
    const nx = (-dy / len) * rDeg;
    const ny = (dx / len) * rDeg;

    const corners = [
        [x1 + nx, y1 + ny], [x2 + nx, y2 + ny],
        [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]
    ];

    // Ray Casting / Point-in-Polygon check
    let inside = false;
    for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
        const xi = corners[i][0], yi = corners[i][1];
        const xj = corners[j][0], yj = corners[j][1];
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
}

//.........................................................

const setRoadDatabase = asyncHandler(async (req, res) => {
    const { condition, coordinates } = req.body

    const city = await City.findById(req.params.id)

    console.log(city)

    if (!city) {
        return res.status(410).json({
            message: 'no city',
            success: false,
        })
    }

    const createdRoad = await Road.create({
        coordinates,
        condition,
    })

    city.roads.push(createdRoad._id)
    await city.save()

    return res.status(210).json({
        createdRoad,
        message: 'successfully city create',
        success: true,
    })

})

//...........................................

const setCityDatabase = asyncHandler(async (req, res) => {
    const { centerCoordinates } = req.body

    const createdCity = await City.create({
        centerCoordinates
    })

    return res.status(210).json({
        createdCity,
        message: 'successfully Roads create',
        success: true,
    })
})

export {
    mapGet,
    setRoadDatabase,
    setCityDatabase,
    setRoadCondition
}