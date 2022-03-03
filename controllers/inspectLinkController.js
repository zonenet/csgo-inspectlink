const config = require('config');
const Inspector = require('../modules/Inspector');
const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');
const gameServer = require('../modules/GameServer');
const Skin = require('../database/models/Skin');

exports.store = async (req, res) => {
  const {
    body: {
      link
    },
  } = req;

  let inspection;

  try {
    inspection = await Inspector.inspect(link, config.get('inspect.timeoutMs'));

    logger.info('Inspected link', inspection);
  } catch (error) {
    logger.warn('Inspection failed', { link });
    logger.error(error);

    return res.status(500).json(ErrorResponse.inspectionFailed());
  }

  if (inspection.defindex === null || inspection.paintindex === null) {
    logger.info('Skin has no item defindex or paintkit defindex, abort');

    return res.status(400).json(ErrorResponse.unsupportedSkin());
  }

  const skin = await Skin.query()
    .whereExists(
      Skin.relatedQuery('item')
        .where('defindex', inspection.defindex),
    )
    .whereExists(
      Skin.relatedQuery('paintkit')
        .where('defindex', inspection.paintindex),
    )
    .withGraphFetched({
      item: true,
      paintkit: true,
    })
    .first();

  if (!skin) {
    logger.info('Skin does not exist in database, abort');

    return res.status(400).json(ErrorResponse.unsupportedSkin());
  }

  const data = {
    paintkit_name: skin.paintkit.name,
    paintkit_defindex: skin.paintkit.defindex,
	paintindex: inspection.paintindex,
    item_name: skin.item.name,
    item_defindex: skin.item.defindex,
    item_class: skin.item.class,
    item_name_technical: skin.item.name_technical,
    item_type: skin.item.type,
    wear: inspection.paintwear,
    seed: inspection.paintseed,
	customname: inspection.customname,
	stickers: inspection.stickers,
    stattrak: inspection.killeaterscoretype === 0 && inspection.killeatervalue !== null
      ? inspection.killeatervalue
      : -1,
  };
  

  return res.status(201).json(data);
};
