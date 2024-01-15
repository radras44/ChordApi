import { BadRequestException, Body, Controller, Param, Post, Res } from '@nestjs/common';
import { VoicingService } from './voicing.service';
import * as Joi from "@hapi/joi"
@Controller('voicing')
export class VoicingController {
  constructor(private readonly voicingService: VoicingService) { }
  @Post(":id")
  async getByChord(@Res() res, @Param("id") id: string, @Body() ops: {
    vStringSize: number,
    vFretSize: number,
    omits: string[]
  }) {
    const reqProps = Joi.object({
      vStringSize: Joi.number().required(),
      vFretSize: Joi.number().required(),
      omits: Joi.array().items(Joi.string()).required()
    })

    const { error } = reqProps.validate(ops)
    if (error) {
      throw new BadRequestException("somthing bad happend", { description: error.message })
    }

    const result = await this.voicingService.getByChord(id, ops)
    return res.status(200).json({
      data: result
      })
  }
}
