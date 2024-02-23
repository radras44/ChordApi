import { BadRequestException, Body, Controller, Param, Post, Res } from '@nestjs/common';
import { VoicingService } from './guitarVoicing.service';
import * as Joi from "@hapi/joi"
import { GetVoicingOps } from 'src/utils/conversor/interfaces/conversorDefs';

@Controller('guitarVoicing')
export class VoicingController {
  constructor(private readonly voicingService: VoicingService) { }
  @Post("/getByConfig")
  async getByChord(@Res() res, @Body() ops: GetVoicingOps) {
    const reqProps = Joi.object({
      vStringSize: Joi.number(),
      vFretSize: Joi.number().required(),
      omits: Joi.array().items(Joi.string()).required(),
      chordName: Joi.string().required(),
      transportable : Joi.boolean(),
      stringComb : Joi.string()
    })

    const { error } = reqProps.validate(ops)
    if (error) {
      throw new BadRequestException("somthing bad happend", { description: error.message })
    }

    const data = await this.voicingService.getByConfig(ops)
    return res.status(200).json({
      result: data.result
    })
  }
}
